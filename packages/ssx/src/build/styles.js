import fs from "node:fs/promises"
import path from "node:path"

import { insertStyleLinks } from "../render/style-links.js"

export const STYLES_MANIFEST = ".vite/ssx-styles.json"

const VITE_DEFAULT_MANIFEST = ".vite/manifest.json"
const LINK_MARKER = "data-ssx-style"

/**
 * Links the CSS that page modules import into each pre-rendered page, so a
 * page is styled before any JavaScript runs: the entry's own styles, and
 * those of the page module and everything it statically imports (CSS
 * modules, a component's `style.css`, a package's stylesheet).
 *
 * Reads the Vite manifest the build wrote, and removes it afterwards when
 * SSX asked for it. Running it again replaces the links it added before, so
 * pages skipped by an incremental build stay current.
 *
 * @param {Array<{ path: string, filePath: string }>} pages - Pages written to `outDir`.
 * @param {Object} options
 * @param {string} options.outDir
 * @param {Object} options.viteConfig - The config the client bundle was built with.
 */
export async function linkPageStyles(pages, { outDir, viteConfig }) {
  const manifestFile = getManifestFile(viteConfig)
  if (!manifestFile) return

  const manifestPath = path.join(outDir, manifestFile)
  const manifest = await readManifest(manifestPath)
  if (!manifest) return

  const base = viteConfig.base ?? "/"
  const entryKeys = Object.keys(manifest).filter((key) => manifest[key].isEntry)

  for (const page of pages) {
    const keys = [...entryKeys, toManifestKey(page.filePath)]
    const files = [...new Set(keys.flatMap((key) => collectCss(manifest, key)))]
    const hrefs = files.map((file) => `${base}${file}`)
    await linkStyles(pageFilePath(page.path, outDir), hrefs)
  }

  if (manifestFile === STYLES_MANIFEST) {
    await fs.rm(manifestPath, { force: true })
    await fs.rmdir(path.dirname(manifestPath)).catch(() => {})
  }
}

/**
 * Where a page's HTML lives in the output directory.
 *
 * @param {string} pagePath - The URL path of the page, e.g. "/blog/hello".
 * @param {string} [outDir="dist"]
 * @returns {string}
 */
export function pageFilePath(pagePath, outDir = "dist") {
  const cleanPath = pagePath.replace(/^\//, "")
  return path.join(outDir, cleanPath, "index.html")
}

function getManifestFile(viteConfig) {
  const manifest = viteConfig.build?.manifest
  if (manifest === true) return VITE_DEFAULT_MANIFEST
  return typeof manifest === "string" ? manifest : null
}

async function readManifest(manifestPath) {
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf-8"))
  } catch {
    return null
  }
}

// The manifest is keyed by source paths relative to the project root.
function toManifestKey(filePath) {
  return path
    .relative(process.cwd(), path.resolve(filePath))
    .split(path.sep)
    .join("/")
}

function collectCss(manifest, key, seen = new Set()) {
  const chunk = manifest[key]
  if (!chunk || seen.has(key)) return []
  seen.add(key)

  const imported = (chunk.imports ?? []).flatMap((importKey) =>
    collectCss(manifest, importKey, seen),
  )
  return [...imported, ...(chunk.css ?? [])]
}

async function linkStyles(htmlPath, hrefs) {
  const html = await fs.readFile(htmlPath, "utf-8").catch(() => null)
  if (html === null) return

  const linked = insertStyleLinks(html, hrefs, LINK_MARKER)
  if (linked !== html) await fs.writeFile(htmlPath, linked, "utf-8")
}
