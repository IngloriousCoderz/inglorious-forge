import { describe, expect, it } from "vitest"

import { layout } from "./layout"

describe("layout", () => {
  it("should render default layout structure", () => {
    const html = layout("<h1>Hello</h1>", {})
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<meta charset="UTF-8" />')
    expect(html).toContain('<div id="root"><h1>Hello</h1></div>')
    expect(html).toContain('<script type="module" src="/main.js"></script>')
  })

  it("should render with custom title and language", () => {
    const html = layout("", { title: "My Page", lang: "fr" })
    expect(html).toContain("<title>My Page</title>")
    expect(html).toContain('<html lang="fr">')
  })

  it("should render meta tags", () => {
    const html = layout("", {
      meta: { description: "Desc", viewport: "width=device-width" },
    })
    expect(html).toContain('<meta name="description" content="Desc">')
    expect(html).toContain(
      '<meta name="viewport" content="width=device-width">',
    )
  })

  it("should render styles", () => {
    const html = layout("", { styles: ["/style.css", "/theme.css"] })
    expect(html).toContain('<link rel="stylesheet" href="/style.css">')
    expect(html).toContain('<link rel="stylesheet" href="/theme.css">')
  })

  it("should render scripts", () => {
    const html = layout("", { scripts: ["/app.js"] })
    expect(html).toContain('<script type="module" src="/app.js"></script>')
  })

  it("should render additional head content", () => {
    const html = layout("", { head: '<link rel="icon" href="/favicon.ico">' })
    expect(html).toContain('<link rel="icon" href="/favicon.ico">')
  })

  it("should emit head content exactly once", () => {
    const html = layout("", {
      head: '<link rel="alternate" hreflang="it" href="https://x.test/it">',
    })

    expect(
      html.match(/hreflang="it"/g),
      "head content must not be duplicated",
    ).toHaveLength(1)
  })

  it("should keep meta charset ahead of head content", () => {
    const head = `<link rel="preload" href="/${"a".repeat(1200)}.woff2" as="font">`
    const html = layout("", { head })

    const charset = html.indexOf("<meta charset")
    const headStart = html.indexOf(head)

    expect(charset).toBeGreaterThan(-1)
    expect(headStart).toBeGreaterThan(charset)
    // Browsers only prescan the first 1024 bytes to detect the encoding.
    expect(charset).toBeLessThan(1024)
  })

  it("should include vite client in dev mode", () => {
    const html = layout("", { isDev: true })
    expect(html).toContain(
      '<script type="module" src="/@vite/client"></script>',
    )
  })

  it("should not include vite client in prod mode", () => {
    const html = layout("", { isDev: false })
    expect(html).not.toContain("/@vite/client")
  })
})
