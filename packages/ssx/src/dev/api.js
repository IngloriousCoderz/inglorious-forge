import { existsSync } from "node:fs"
import path from "node:path"

export const createApiMiddleware = (rootDir, loader, onError) => {
  return async (req, res, next) => {
    const [urlPath] = req.url.split("?")

    if (!urlPath.startsWith("/api/")) return next()

    try {
      const apiPath = urlPath.replace("/api/", "")
      const segments = apiPath.split("/")
      const searchPaths = []

      for (let i = segments.length; i > 0; i--) {
        searchPaths.push(segments.slice(0, i).join("/"))
      }

      let module = null

      for (const searchPath of searchPaths) {
        const apiFile = path.join(rootDir, "src", "api", `${searchPath}.js`)
        if (existsSync(apiFile)) {
          module = await loader(apiFile)
          break
        }
      }

      if (!module) {
        res.statusCode = 404
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ error: "Not found" }))
        return
      }

      const method = req.method.toUpperCase()

      if (!module[method]) {
        res.statusCode = 405
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ error: `Method ${method} not allowed` }))
        return
      }

      const request = createRequest(req)
      const response = await module[method](request)

      await sendResponse(res, response)
    } catch (error) {
      onError?.(error)
      next(error)
    }
  }
}

function createRequest(req) {
  const protocol = req.socket.encrypted ? "https" : "http"
  const host = req.headers.host || "localhost"
  const url = `${protocol}://${host}${req.url}`

  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
  })
}

async function sendResponse(res, response) {
  res.statusCode = response.status

  for (const [key, value] of response.headers) {
    res.setHeader(key, value)
  }

  const body = await response.text()
  res.end(body)
}
