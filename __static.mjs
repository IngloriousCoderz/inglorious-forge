import http from "node:http"
import { readFile } from "node:fs/promises"
import { extname, join, normalize } from "node:path"
const root = process.argv[2], port = Number(process.argv[3])
const types = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".svg":"image/svg+xml" }
http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0])
    if (p === "/" || p.endsWith("/")) p += "index.html"
    const file = normalize(join(root, p))
    const data = await readFile(file)
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" })
    res.end(data)
  } catch { res.writeHead(404); res.end("nf") }
}).listen(port, () => console.log("static on "+port))
