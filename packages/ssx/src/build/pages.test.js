import fs from "node:fs/promises"
import path from "node:path"

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import { renderPage } from "../render/index.js"
import { extractPageMetadata } from "./metadata.js"
import { generatePages } from "./pages"

vi.mock("../render/index.js")
vi.mock("./metadata.js")

describe("generatePages", () => {
  // Create a temporary page module for testing dynamic imports
  const tempDir = path.join(import.meta.dirname, "__temp_pages__")
  const pageFile = path.join(tempDir, "test-page.js")

  // Mock console.log to keep test output clean
  vi.spyOn(console, "log").mockImplementation(() => {})

  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true })
    // Create a dummy module that exports a load function
    await fs.writeFile(
      pageFile,
      `
      export const load = async (entity, page) => {
        page.loaded = true
      }
      export const render = () => {}
      `,
    )
  })

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it("should generate HTML and metadata by default", async () => {
    const store = { _api: { getEntity: vi.fn(() => ({})) } }
    const pages = [{ path: "/p1", filePath: pageFile, moduleName: "p1" }]

    renderPage.mockResolvedValue("<html></html>")
    extractPageMetadata.mockReturnValue({ title: "Test" })

    await generatePages(store, pages)

    expect(pages[0].html).toBe("<html></html>")
    expect(pages[0].metadata).toEqual({ title: "Test" })
    expect(pages[0].loaded).toBe(true) // Verify load() was called
    expect(renderPage).toHaveBeenCalled()
    expect(extractPageMetadata).toHaveBeenCalled()
  })

  it("should skip HTML generation when disabled", async () => {
    const store = { _api: { getEntity: vi.fn(() => ({})) } }
    const pages = [{ path: "/p2", filePath: pageFile, moduleName: "p2" }]

    vi.clearAllMocks()

    await generatePages(store, pages, { shouldGenerateHtml: false })

    expect(pages[0].html).toBeUndefined()
    expect(pages[0].metadata).toBeDefined()
    expect(renderPage).not.toHaveBeenCalled()
    expect(extractPageMetadata).toHaveBeenCalled()
  })

  it("should skip metadata generation when disabled", async () => {
    const store = { _api: { getEntity: vi.fn(() => ({})) } }
    const pages = [{ path: "/p3", filePath: pageFile, moduleName: "p3" }]

    vi.clearAllMocks()
    renderPage.mockResolvedValue("<html></html>")

    await generatePages(store, pages, { shouldGenerateMetadata: false })

    expect(pages[0].html).toBeDefined()
    expect(pages[0].metadata).toBeUndefined()
    expect(renderPage).toHaveBeenCalled()
    expect(extractPageMetadata).not.toHaveBeenCalled()
  })

  it("should set entity.locale from page.locale even without load()", async () => {
    const entity = {}
    const store = { _api: { getEntity: vi.fn(() => entity) } }
    const pages = [
      {
        path: "/it/p4",
        filePath: "virtual-page.js",
        moduleName: "p4",
        locale: "it",
      },
    ]
    const loader = vi.fn(async () => ({ render: () => {} }))

    vi.clearAllMocks()
    renderPage.mockResolvedValue("<html></html>")
    extractPageMetadata.mockReturnValue({})

    await generatePages(store, pages, {}, loader)

    expect(entity.locale).toBe("it")
  })

  it("should overwrite entity.locale for each localized page render", async () => {
    const entity = { locale: "en" }
    const store = { _api: { getEntity: vi.fn(() => entity) } }
    const pages = [
      {
        path: "/it/p5",
        filePath: "virtual-page.js",
        moduleName: "p5",
        locale: "it",
      },
      {
        path: "/pt/p5",
        filePath: "virtual-page.js",
        moduleName: "p5",
        locale: "pt",
      },
    ]
    const loader = vi.fn(async () => ({ render: () => {} }))

    vi.clearAllMocks()
    renderPage.mockResolvedValue("<html></html>")
    extractPageMetadata.mockReturnValue({})

    await generatePages(store, pages, {}, loader)

    expect(entity.locale).toBe("pt")
  })
})
