import path from "node:path"

import connect from "connect"
import { createServer } from "vite"

import { renderPage } from "../render/index.js"
import { getPages, matchRoute } from "../router/index.js"
import { generateApp } from "../scripts/app.js"
import { generateStore } from "../store/index.js"
import { loadConfig } from "../utils/config.js"
import { createApiMiddleware } from "./api.js"
import { createViteConfig, virtualFiles } from "./vite-config.js"

/**
 * Starts the development server.
 * It sets up a Vite server with SSR middleware to render pages on demand.
 *
 * @param {Object} options - Configuration options.
 * @returns {Promise<{close: Function}>} A promise that resolves to a server control object.
 */
export async function dev(options = {}) {
  const config = await loadConfig(options)

  const mergedOptions = { ...config, ...options }
  const { rootDir = "." } = mergedOptions

  const pagesDir = path.join(rootDir, "src", "pages")

  console.log("🚀 Starting dev server...\n")

  // Create Vite dev server
  const viteConfig = createViteConfig(mergedOptions)
  const viteServer = await createServer(viteConfig)
  const loader = (p) => viteServer.ssrLoadModule(p)

  // Use Vite's middleware first (handles HMR, static files, etc.)
  const connectServer = connect()
  connectServer.use(viteServer.middlewares)

  const apiMiddleware = createApiMiddleware(rootDir, loader, (error) =>
    viteServer.ssrFixStacktrace(error),
  )
  connectServer.use(apiMiddleware)

  // Add SSR middleware
  connectServer.use(async (req, res, next) => {
    const [url] = req.url.split("?")

    try {
      // Skip special routes, static files, AND public assets
      if (
        url.startsWith("/@") ||
        url.startsWith("/api/") ||
        url.includes(".") || // Vite handles static files
        url === "/favicon.ico"
      ) {
        return next() // Let Vite serve it
      }

      // Get all pages on each request (in dev mode, pages might be added/removed)
      const pages = await getPages(pagesDir, mergedOptions, loader)

      // Find matching page
      const page = pages.find((p) => matchRoute(p.path, url))
      if (!page) return next()

      const module = await loader(page.filePath)
      page.module = module

      // Generate store for THIS request (to pick up changes)
      const store = await generateStore(pages, mergedOptions, loader)

      const entity = store._api.getEntity(page.moduleName)
      if (page.locale) {
        entity.locale = page.locale
      }

      if (module.load) {
        await module.load(entity, page)
      }

      // Generate and update the virtual app file BEFORE rendering
      const app = generateApp(pages, { ...mergedOptions, isDev: true })
      virtualFiles.set("/main.js", app)

      // Invalidate the virtual module to ensure Vite picks up changes
      const virtualModule = viteServer.moduleGraph.getModuleById("/main.js")
      if (virtualModule) {
        viteServer.moduleGraph.invalidateModule(virtualModule)
      }

      const html = await renderPage(store, page, entity, {
        ...mergedOptions,
        wrap: true,
        isDev: true,
      })

      res.setHeader("Content-Type", "text/html")
      res.end(html)
    } catch (error) {
      viteServer.ssrFixStacktrace(error)
      next(error) // Let Vite handle the error overlay
    }
  })

  const { port = 3000 } = viteConfig.server ?? {}
  const server = connectServer.listen(port)

  console.log(`\n✨ Dev server running at http://localhost:${port}\n`)
  console.log("Press Ctrl+C to stop\n")

  return {
    close: () => {
      server.close()
      viteServer.close()
    },
  }
}
