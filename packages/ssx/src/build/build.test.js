import fs from "node:fs/promises"
import path from "node:path"

import { build as viteBuild, createServer } from "vite"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getPages } from "../router/index.js"
import { generateApp } from "../scripts/app.js"
import { generateStore } from "../store/index.js"
import { loadConfig } from "../utils/config.js"
import { build } from "."
import {
  createManifest,
  determineRebuildPages,
  hashEntities,
  loadManifest,
  saveManifest,
} from "./manifest.js"
import { generatePages } from "./pages.js"
import { copyPublicDir } from "./public.js"
import { generateRSS } from "./rss.js"
import { generateSitemap } from "./sitemap.js"
import { createViteConfig } from "./vite-config.js"

vi.mock("node:fs/promises")
vi.mock("vite")
vi.mock("../router/index.js")
vi.mock("../scripts/app.js")
vi.mock("../store/index.js")
vi.mock("../utils/config.js")
vi.mock("./manifest.js")
vi.mock("./pages.js")
vi.mock("./public.js")
vi.mock("./rss.js")
vi.mock("./sitemap.js")
vi.mock("./vite-config.js")

describe("build", () => {
  // Mock console to keep output clean
  vi.spyOn(console, "log").mockImplementation(() => {})

  beforeEach(() => {
    createServer.mockResolvedValue({
      ssrLoadModule: vi.fn(),
      close: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should run a full build sequence", async () => {
    // Setup mocks
    loadConfig.mockResolvedValue({})
    loadManifest.mockResolvedValue(null) // First build
    getPages.mockResolvedValue([{ path: "/" }])
    hashEntities.mockResolvedValue("hash")
    generateStore.mockResolvedValue({
      store: {},
      entities: {},
      hasTypesFile: false,
      hasEntitiesFile: false,
    })
    generatePages
      .mockResolvedValueOnce([{ path: "/", html: "<html></html>" }])
      .mockResolvedValueOnce([])
    generateApp.mockReturnValue("console.log('app')")
    createViteConfig.mockReturnValue({})
    createManifest.mockResolvedValue({})

    const result = await build({ rootDir: "src", outDir: "dist" })

    // Verify sequence
    expect(fs.rm).toHaveBeenCalledWith("dist", { recursive: true, force: true })
    expect(fs.mkdir).toHaveBeenCalledWith("dist", { recursive: true })
    expect(copyPublicDir).toHaveBeenCalled()
    expect(getPages).toHaveBeenCalled()
    expect(generateStore).toHaveBeenCalled()
    expect(generatePages).toHaveBeenCalledTimes(2) // Changed + Skipped (empty)
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.normalize("dist/index.html"),
      "<html></html>",
      "utf-8",
    )
    expect(generateApp).toHaveBeenCalled()
    expect(viteBuild).toHaveBeenCalled()
    expect(saveManifest).toHaveBeenCalled()

    expect(result).toEqual({ changed: 1, skipped: 0 })
  })

  it("should handle incremental builds", async () => {
    const manifest = { entities: "hash" }
    loadManifest.mockResolvedValue(manifest)
    hashEntities.mockResolvedValue("hash")

    const allPages = [{ path: "/changed" }, { path: "/skipped" }]
    getPages.mockResolvedValue(allPages)

    determineRebuildPages.mockResolvedValue({
      pagesToBuild: [{ path: "/changed" }],
      pagesToSkip: [{ path: "/skipped" }],
    })

    generatePages
      .mockResolvedValueOnce([{ path: "/changed", html: "<html></html>" }]) // Changed
      .mockResolvedValueOnce([{ path: "/skipped" }]) // Skipped

    const result = await build({ incremental: true })

    expect(determineRebuildPages).toHaveBeenCalled()
    expect(generatePages).toHaveBeenCalledTimes(2)
    // Should only write changed pages
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("changed"),
      expect.any(String),
      expect.any(String),
    )
    expect(result).toEqual({ changed: 1, skipped: 1 })
  })

  it("should generate sitemap and rss if configured", async () => {
    loadConfig.mockResolvedValue({})
    getPages.mockResolvedValue([])
    generatePages.mockResolvedValue([])

    await build({
      sitemap: { hostname: "https://example.com" },
      rss: { link: "https://example.com" },
    })

    expect(generateSitemap).toHaveBeenCalled()
    expect(generateRSS).toHaveBeenCalled()
  })
})
