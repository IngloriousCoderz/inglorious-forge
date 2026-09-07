import fs from "node:fs/promises"

import { afterEach, describe, expect, it, vi } from "vitest"

import { generateSitemap } from "./sitemap"

const mockWriteFile = vi.hoisted(() => vi.fn())

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    writeFile: mockWriteFile,
    default: {
      ...actual.default,
      writeFile: mockWriteFile,
    },
  }
})

describe("generateSitemap", () => {
  const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "log").mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should generate valid sitemap xml", async () => {
    const pages = [
      {
        metadata: {
          loc: "https://example.com/",
          lastmod: "2024-01-01",
          changefreq: "daily",
          priority: 1.0,
        },
      },
      {
        metadata: {
          loc: "https://example.com/about",
          lastmod: "2024-01-02",
          changefreq: "monthly",
          priority: 0.8,
        },
      },
    ]

    await generateSitemap(pages, { hostname: "https://example.com" })

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    const [filePath, content] = fs.writeFile.mock.calls[0]

    expect(filePath).toContain("sitemap.xml")
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(content).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    )
    expect(content).toContain("<loc>https://example.com/</loc>")
    expect(content).toContain("<priority>1</priority>")
    expect(content).toContain("<loc>https://example.com/about</loc>")
    expect(content).toContain("<changefreq>monthly</changefreq>")
  })

  it("should warn and skip if hostname is missing", async () => {
    await generateSitemap([], {})
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("No hostname"),
    )
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  it("should filter pages based on filter function", async () => {
    const pages = [
      { path: "/public", metadata: { loc: "https://site.com/public" } },
      { path: "/admin", metadata: { loc: "https://site.com/admin" } },
    ]

    const filter = (page) => page.path !== "/admin"

    await generateSitemap(pages, { hostname: "https://site.com", filter })

    const [, content] = fs.writeFile.mock.calls[0]
    expect(content).toContain("/public")
    expect(content).not.toContain("/admin")
  })

  it("should escape special characters in URLs", async () => {
    const pages = [{ metadata: { loc: "https://site.com/foo?bar=1&baz=2" } }]

    await generateSitemap(pages, { hostname: "https://site.com" })

    const [, content] = fs.writeFile.mock.calls[0]
    expect(content).toContain("foo?bar=1&amp;baz=2")
  })
})
