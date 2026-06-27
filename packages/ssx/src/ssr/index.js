import path from "node:path"

import connect from "connect"
import { createServer } from "vite"

import { createApiMiddleware } from "../dev/api.js"
import { createViteConfig, virtualFiles } from "../dev/vite-config.js"
import { renderPage } from "../render/index.js"
import { getPages, matchRoute } from "../router/index.js"
import { generateApp } from "../scripts/app.js"
import { generateStore } from "../store/index.js"
import { loadConfig } from "../utils/config.js"

export async function ssr(options = {}) {
  const config = await loadConfig(options)
  const mergedOptions = { ...config, ...options }
  const { rootDir = "." } = mergedOptions

  console.log("🚀 Starting SSR server...\n")

  const viteConfig = createViteConfig(mergedOptions)
  const viteServer = await createServer(viteConfig)
  const loader = (p) => viteServer.ssrLoadModule(p)

  const connectServer = connect()
  connectServer.use(viteServer.middlewares)

  const apiMiddleware = createApiMiddleware(rootDir, loader, (error) =>
    viteServer.ssrFixStacktrace(error),
  )
  connectServer.use(apiMiddleware)

  const pagesDir = path.join(rootDir, "src", "pages")
  const pages = await getPages(pagesDir, mergedOptions, loader)
  await registerApp(pages, mergedOptions, loader, viteServer)

  connectServer.use(async (req, res, next) => {
    const [url] = req.url.split("?")

    try {
      if (
        url.startsWith("/@") ||
        url.startsWith("/api/") ||
        url.includes(".") ||
        url === "/favicon.ico"
      ) {
        return next()
      }

      const result = await renderRequest(url, {
        rootDir,
        options: { ...mergedOptions, isDev: false },
        loader,
        viteServer,
        pages,
      })

      if (!result) {
        return next()
      }

      res.setHeader("Content-Type", "text/html")
      res.end(result.html)
    } catch (error) {
      viteServer.ssrFixStacktrace(error)
      next(error)
    }
  })

  const { port = 3000 } = viteConfig.server ?? {}
  const server = connectServer.listen(port)

  console.log(`\n✨ SSR server running at http://localhost:${port}\n`)
  console.log("Press Ctrl+C to stop\n")

  return {
    close: () => {
      server.close()
      viteServer.close()
    },
  }
}

export async function renderRequest(
  url,
  { rootDir = ".", options = {}, loader, viteServer, pages } = {},
) {
  const [pathname] = String(url || "").split("?")

  if (
    pathname.startsWith("/@") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return null
  }

  let resolvedPages = pages
  if (resolvedPages == null) {
    const pagesDir = path.join(rootDir, "src", "pages")
    resolvedPages = await getPages(pagesDir, options, loader)
    await registerApp(resolvedPages, options, loader, viteServer)
  }

  const origPage = resolvedPages.find((candidate) =>
    matchRoute(candidate.path, pathname),
  )
  if (!origPage) {
    return null
  }

  const module = await loader(origPage.filePath)
  const page = { ...origPage }
  page.module = module

  const store = await generateStore(resolvedPages, options, loader)
  const [entity] = store._api.getEntities(page.moduleName)
  if (page.locale) {
    entity.locale = page.locale
  }

  if (module.load) {
    await module.load(entity, page)
  }

  const html = await renderPage(store, page, entity, {
    ...options,
    wrap: true,
    isDev: Boolean(options.isDev),
  })

  return { html, page, entity, store }
}

async function registerApp(pages, options, loader, viteServer) {
  const app = await generateApp(
    pages,
    { ...options, isDev: Boolean(options.isDev) },
    loader,
  )
  virtualFiles.set("/main.js", app)

  if (viteServer?.moduleGraph?.getModuleById) {
    const virtualModule = viteServer.moduleGraph.getModuleById("/main.js")
    if (virtualModule) {
      viteServer.moduleGraph.invalidateModule(virtualModule)
    }
  }
}
