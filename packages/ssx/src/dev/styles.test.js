// @vitest-environment node
import path from "node:path"

import { describe, expect, it } from "vitest"

import { collectDevStyles } from "./styles.js"

describe("collectDevStyles", () => {
  it("collects the stylesheets a page imports, in import order", () => {
    const layoutCss = module("/src/app/layout/style.module.css")
    const layout = module("/src/app/layout/index.js", [layoutCss])
    const pageCss = module("/src/pages/about/style.module.css")
    const page = module("/src/pages/about/index.js", [layout, pageCss])
    const server = viteServer({ "src/pages/about/index.js": page })

    expect(
      collectDevStyles(server, { filePath: "src/pages/about/index.js" }),
    ).toEqual([
      "/src/app/layout/style.module.css",
      "/src/pages/about/style.module.css",
    ])
  })

  it("leaves out what stylesheets import, which Vite inlines", () => {
    const fonts = module("/src/styles/fonts.css")
    const global = module("/src/styles/global.css", [fonts])
    const page = module("/src/pages/index.js", [global])
    const server = viteServer({ "src/pages/index.js": page })

    expect(
      collectDevStyles(server, { filePath: "src/pages/index.js" }),
    ).toEqual(["/src/styles/global.css"])
  })

  it("skips stylesheets imported as strings or URLs", () => {
    const page = module("/src/pages/index.js", [
      module("/src/a.css?inline"),
      module("/src/b.css?raw"),
      module("/src/c.css?url"),
      module("/src/d.scss"),
    ])
    const server = viteServer({ "src/pages/index.js": page })

    expect(
      collectDevStyles(server, { filePath: "src/pages/index.js" }),
    ).toEqual(["/src/d.scss"])
  })

  it("lists each stylesheet once, even when imported twice", () => {
    const shared = module("/src/styles/page.module.css")
    const header = module("/src/header.js", [shared])
    const page = module("/src/pages/index.js", [header, shared])
    const server = viteServer({ "src/pages/index.js": page })

    expect(
      collectDevStyles(server, { filePath: "src/pages/index.js" }),
    ).toEqual(["/src/styles/page.module.css"])
  })

  it("puts the store's stylesheets first, as the entry's", () => {
    const rootDir = path.join(import.meta.dirname, "fixtures")
    const banner = module("/src/banner.module.css")
    const types = module("/src/store/types.js", [banner])
    const page = module("/src/pages/index.js", [module("/src/page.css")])
    const server = viteServer({
      [path.join(rootDir, "src/store/types.js")]: types,
      "src/pages/index.js": page,
    })

    expect(
      collectDevStyles(server, { rootDir, filePath: "src/pages/index.js" }),
    ).toEqual(["/src/banner.module.css", "/src/page.css"])
  })

  it("collects nothing without a module graph", () => {
    expect(
      collectDevStyles(undefined, { filePath: "src/pages/index.js" }),
    ).toEqual([])
  })
})

function module(url, importedModules = []) {
  return { url, importedModules: new Set(importedModules) }
}

function viteServer(modulesByFile) {
  const byPath = new Map(
    Object.entries(modulesByFile).map(([file, mod]) => [
      path.resolve(file),
      mod,
    ]),
  )
  return {
    environments: {
      ssr: {
        moduleGraph: {
          getModulesByFile: (file) =>
            byPath.has(file) ? new Set([byPath.get(file)]) : undefined,
        },
      },
    },
  }
}
