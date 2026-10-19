import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { createViteConfig, virtualFiles } from "./vite-config"

describe("createViteConfig", () => {
  it("should create default config", () => {
    const config = createViteConfig()
    expect(config.root).toBe(process.cwd())
    expect(config.server.port).toBe(3000)
    expect(config.resolve.alias["@"]).toBe(path.resolve(process.cwd(), "src"))
  })

  it("should respect custom rootDir", () => {
    const config = createViteConfig({ rootDir: "app" })
    expect(config.resolve.alias["@"]).toBe(
      path.resolve(process.cwd(), "app", "src"),
    )
  })

  it("should merge custom vite config", () => {
    const config = createViteConfig({
      vite: {
        server: { port: 4000 },
        define: { __TEST__: true },
      },
    })
    expect(config.server.port).toBe(4000)
    expect(config.define.__TEST__).toBe(true)
  })

  it("should let the command-line port override the config's", () => {
    const config = createViteConfig({
      port: 5000,
      vite: { server: { port: 4000 } },
    })
    expect(config.server.port).toBe(5000)
  })
})

describe("virtualPlugin", () => {
  afterEach(() => {
    virtualFiles.clear()
  })

  it("should resolve and load virtual files", () => {
    const config = createViteConfig()
    const plugin = config.plugins.find((p) => p.name === "ssx-virtual-files")

    virtualFiles.set("/virtual.js", "console.log('virtual')")

    expect(plugin.resolveId("/virtual.js")).toBe("/virtual.js")
    expect(plugin.load("/virtual.js")).toBe("console.log('virtual')")
  })
})
