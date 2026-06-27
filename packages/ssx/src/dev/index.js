import connect from "connect"
import { createServer } from "vite"

import { renderRequest } from "../ssr/index.js"
import { loadConfig } from "../utils/config.js"
import { createApiMiddleware } from "./api.js"
import { createViteConfig } from "./vite-config.js"

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

      const result = await renderRequest(url, {
        rootDir,
        options: { ...mergedOptions, isDev: true },
        loader,
        viteServer,
      })

      if (!result) {
        return next()
      }

      res.setHeader("Content-Type", "text/html")
      res.end(result.html)
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
