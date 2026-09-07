import fs from "node:fs/promises"

import { afterEach, describe, expect, it, vi } from "vitest"

import { generateRSS } from "./rss"

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

describe("generateRSS", () => {
  const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "log").mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should generate valid RSS xml", async () => {
    const pages = [
      {
        metadata: {
          title: "Post 1",
          path: "/post-1",
          date: "2024-01-01",
          description: "Desc 1",
        },
      },
    ]

    await generateRSS(pages, {
      link: "https://example.com",
      title: "My Blog",
    })

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    const [filePath, content] = fs.writeFile.mock.calls[0]

    expect(filePath).toContain("feed.xml")
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(content).toContain('<rss version="2.0"')
    expect(content).toContain("<title>My Blog</title>")
    expect(content).toContain("<link>https://example.com</link>")
    expect(content).toContain("<item>")
    expect(content).toContain("<title>Post 1</title>")
    expect(content).toContain("<link>https://example.com/post-1</link>")
    expect(content).toContain("<pubDate>Mon, 01 Jan 2024")
  })

  it("should warn and skip if link is missing", async () => {
    await generateRSS([], {})
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("No link provided"),
    )
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  it("should sort items by newest date", async () => {
    const pages = [
      { metadata: { title: "Old", date: "2023-01-01" } },
      { metadata: { title: "New", date: "2024-01-01" } },
    ]

    await generateRSS(pages, { link: "https://site.com" })

    const [, content] = fs.writeFile.mock.calls[0]
    const oldIndex = content.indexOf("<title>Old</title>")
    const newIndex = content.indexOf("<title>New</title>")

    expect(newIndex).toBeLessThan(oldIndex)
  })

  it("should respect maxItems option", async () => {
    const pages = Array.from({ length: 10 }, (_, i) => ({
      metadata: { title: `Post ${i}`, date: `2024-01-${i + 1}` },
    }))

    await generateRSS(pages, { link: "https://site.com", maxItems: 5 })

    const [, content] = fs.writeFile.mock.calls[0]
    const matches = content.match(/<item>/g)
    expect(matches).toHaveLength(5)
  })

  it("should filter pages", async () => {
    const pages = [
      { path: "/blog/1", metadata: { title: "Blog 1" } },
      { path: "/about", metadata: { title: "About" } },
    ]

    const filter = (page) => page.path.startsWith("/blog")

    await generateRSS(pages, { link: "https://site.com", filter })

    const [, content] = fs.writeFile.mock.calls[0]
    expect(content).toContain("Blog 1")
    expect(content).not.toContain("About")
  })

  it("should escape special characters", async () => {
    const pages = [{ metadata: { title: "Q&A <Test>" } }]
    await generateRSS(pages, { link: "https://site.com" })
    const [, content] = fs.writeFile.mock.calls[0]
    expect(content).toContain("Q&amp;A &lt;Test&gt;")
  })
})
