/**
 * @vitest-environment node
 */
import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { linkPageStyles, pageFilePath, STYLES_MANIFEST } from "./styles.js"

const PAGE_HTML = "<html><head><title>Hi</title></head><body></body></html>"
const MANIFEST = {
  "dist/main.js": { file: "main.js", isEntry: true, css: ["main.css"] },
  "src/pages/index.js": {
    file: "index.abc.js",
    isDynamicEntry: true,
    imports: ["_lib.js"],
    css: ["index.css"],
  },
  "src/pages/about.js": { file: "about.abc.js", isDynamicEntry: true },
  "_lib.js": { file: "lib.abc.js", css: ["lib.css"] },
}

describe("linkPageStyles", () => {
  let outDir

  beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(tmpdir(), "ssx-styles-"))
    await writePage("/", PAGE_HTML)
    await writePage("/about", PAGE_HTML)
    await writeManifest(STYLES_MANIFEST, MANIFEST)
  })

  afterEach(async () => {
    await fs.rm(outDir, { recursive: true, force: true })
  })

  it("links the entry's CSS, then the page's imports' and its own", async () => {
    await linkPageStyles(pages(), { outDir, viteConfig: viteConfig() })

    const html = await readPage("/")
    expect(stylesheets(html)).toEqual(["/main.css", "/lib.css", "/index.css"])
    expect(html.indexOf("/main.css")).toBeLessThan(html.indexOf("</head>"))
  })

  it("links only the entry's CSS to a page without styles of its own", async () => {
    await linkPageStyles(pages(), { outDir, viteConfig: viteConfig() })

    expect(stylesheets(await readPage("/about"))).toEqual(["/main.css"])
  })

  it("replaces its own links when run again", async () => {
    await linkPageStyles(pages(), { outDir, viteConfig: viteConfig() })
    await writeManifest(STYLES_MANIFEST, MANIFEST)
    await linkPageStyles(pages(), { outDir, viteConfig: viteConfig() })

    expect(stylesheets(await readPage("/"))).toEqual([
      "/main.css",
      "/lib.css",
      "/index.css",
    ])
  })

  it("prefixes the links with Vite's base", async () => {
    await linkPageStyles(pages(), {
      outDir,
      viteConfig: viteConfig({ base: "/docs/" }),
    })

    expect(stylesheets(await readPage("/about"))).toEqual(["/docs/main.css"])
  })

  it("removes the manifest it asked for", async () => {
    await linkPageStyles(pages(), { outDir, viteConfig: viteConfig() })

    expect(existsSync(path.join(outDir, STYLES_MANIFEST))).toBe(false)
    expect(existsSync(path.join(outDir, path.dirname(STYLES_MANIFEST)))).toBe(
      false,
    )
  })

  it("keeps a manifest the site asked for itself", async () => {
    await writeManifest(".vite/manifest.json", MANIFEST)

    await linkPageStyles(pages(), {
      outDir,
      viteConfig: { build: { manifest: true } },
    })

    expect(stylesheets(await readPage("/about"))).toEqual(["/main.css"])
    expect(existsSync(path.join(outDir, ".vite/manifest.json"))).toBe(true)
  })

  it("leaves pages alone without a manifest", async () => {
    await linkPageStyles(pages(), { outDir, viteConfig: {} })

    expect(await readPage("/")).toBe(PAGE_HTML)
  })

  async function writePage(pagePath, html) {
    const file = pageFilePath(pagePath, outDir)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, html)
  }

  function readPage(pagePath) {
    return fs.readFile(pageFilePath(pagePath, outDir), "utf-8")
  }

  async function writeManifest(file, manifest) {
    const manifestPath = path.join(outDir, file)
    await fs.mkdir(path.dirname(manifestPath), { recursive: true })
    await fs.writeFile(manifestPath, JSON.stringify(manifest))
  }
})

function pages() {
  return [
    { path: "/", filePath: "src/pages/index.js" },
    { path: "/about", filePath: "src/pages/about.js" },
  ]
}

function viteConfig(overrides = {}) {
  return { build: { manifest: STYLES_MANIFEST }, ...overrides }
}

function stylesheets(html) {
  return [...html.matchAll(/<link rel="stylesheet" href="([^"]*)"/g)].map(
    ([, href]) => href,
  )
}
