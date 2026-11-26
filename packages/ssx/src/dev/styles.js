import { existsSync } from "node:fs"
import path from "node:path"

export const DEV_LINK_MARKER = "data-ssx-dev-style"

const STYLESHEET =
  /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
const NOT_LINKED = /[?&](?:inline|raw|url)\b/
const STORE_FILES = ["types.js", "types.ts", "entities.js", "entities.ts"]

/**
 * The stylesheets a page imports while Vite serves the sources, so the page
 * can link them and be styled before its JavaScript runs: the store's (the
 * entry's, in a build), then those of the page module and its imports, in
 * import order. Read from the module graph of the server render, so call it
 * after rendering the page.
 *
 * Stylesheets that other stylesheets `@import` are left out: Vite inlines
 * them when it serves the one importing them.
 *
 * @param {Object} viteServer - The Vite dev server the page was rendered with.
 * @param {Object} options
 * @param {string} [options.rootDir="."]
 * @param {string} options.filePath - The page module.
 * @returns {string[]} The stylesheets' URLs.
 */
export function collectDevStyles(viteServer, { rootDir = ".", filePath }) {
  const graph =
    viteServer?.environments?.ssr?.moduleGraph ?? viteServer?.moduleGraph
  if (!graph?.getModulesByFile) return []

  const storeDir = path.join(rootDir, "src", "store")
  const files = [
    ...STORE_FILES.map((file) => path.join(storeDir, file)).filter(existsSync),
    filePath,
  ]

  const urls = []
  const seen = new Set()
  for (const file of files) {
    for (const module of graph.getModulesByFile(path.resolve(file)) ?? []) {
      collectStylesheets(module, urls, seen)
    }
  }
  return [...new Set(urls)]
}

function collectStylesheets(module, urls, seen) {
  if (seen.has(module)) return
  seen.add(module)

  if (STYLESHEET.test(module.url)) {
    if (!NOT_LINKED.test(module.url)) urls.push(module.url)
    return
  }

  for (const imported of module.importedModules) {
    collectStylesheets(imported, urls, seen)
  }
}
