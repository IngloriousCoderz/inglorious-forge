import { existsSync } from "node:fs"
import { stat } from "node:fs/promises"
import http from "node:http"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

import connect from "connect"

import { createApiMiddleware } from "../dev/api.js"
import { loadConfig } from "../utils/config.js"

const require = createRequire(import.meta.url)

/**
 * Starts a production server that serves static files and API routes.
 *
 * @param {Object} options - Configuration options.
 * @returns {Promise<{close: Function}>} A promise that resolves to a server control object.
 */
export async function serve(options = {}) {
  const config = await loadConfig(options)

  const mergedOptions = { ...config, ...options }
  const { rootDir = ".", outDir = "dist" } = mergedOptions

  const { port = 3000 } = mergedOptions.vite?.server ?? {}

  console.log("🚀 Starting production server...\n")

  const connectServer = connect()

  const distPath = path.resolve(process.cwd(), outDir)
  const srcPath = path.resolve(process.cwd(), rootDir, "src")

  const hasApi = existsSync(path.join(srcPath, "api"))
  if (hasApi) {
    const loader = (p) => import(pathToFileURL(p))
    const apiMiddleware = createApiMiddleware(rootDir, loader)
    connectServer.use(apiMiddleware)
  }

  connectServer.use(serveStatic(distPath))

  const server = http.createServer(connectServer)

  await new Promise((resolve) => server.listen(port, resolve))

  console.log(`\n✨ Production server running at http://localhost:${port}\n`)
  console.log(`📁 Serving from: ${distPath}\n`)
  if (hasApi) {
    console.log(`⚡ API routes enabled from: ${path.join(srcPath, "api")}\n`)
  }
  console.log("Press Ctrl+C to stop\n")

  return {
    close: () => server.close(),
  }
}

function serveStatic(root) {
  return async (req, res, next) => {
    const [urlPath] = req.url.split("?")

    let filePath = path.join(root, urlPath)

    if (urlPath === "/" || urlPath === "") {
      filePath = path.join(root, "index.html")
    } else if (urlPath.endsWith("/")) {
      filePath = path.join(root, urlPath, "index.html")
    } else {
      const stats = await stat(filePath).catch(() => null)
      if (stats?.isDirectory()) {
        filePath = path.join(filePath, "index.html")
      }
    }

    if (!existsSync(filePath)) {
      return next()
    }

    const ext = path.extname(filePath)
    const contentType = getContentType(ext)

    res.setHeader("Content-Type", contentType)

    try {
      const content = require("fs").readFileSync(filePath)
      res.end(content)
    } catch {
      next()
    }
  }
}

function getContentType(ext) {
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".xml": "application/xml",
    ".txt": "text/plain",
  }

  return types[ext] || "application/octet-stream"
}
