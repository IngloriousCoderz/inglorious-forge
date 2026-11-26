import { describe, expect, it } from "vitest"

import { insertStyleLinks } from "./style-links.js"

const PAGE = "<html><head><title>Hi</title></head><body></body></html>"

describe("insertStyleLinks", () => {
  it("links the stylesheets at the end of the head, in order", () => {
    const html = insertStyleLinks(PAGE, ["/a.css", "/b.css"], "data-test")

    expect(html).toContain(
      '<link rel="stylesheet" href="/a.css" data-test>\n<link rel="stylesheet" href="/b.css" data-test></head>',
    )
  })

  it("replaces the links with the same marker instead of adding more", () => {
    const once = insertStyleLinks(PAGE, ["/a.css"], "data-test")
    const twice = insertStyleLinks(once, ["/b.css"], "data-test")

    expect(twice).not.toContain("/a.css")
    expect(twice.match(/<link /g)).toHaveLength(1)
  })

  it("leaves links with other markers alone", () => {
    const built = insertStyleLinks(PAGE, ["/a.css"], "data-built")
    const both = insertStyleLinks(built, ["/b.css"], "data-dev")

    expect(both).toContain("/a.css")
    expect(both).toContain("/b.css")
  })

  it("adds the attributes a stylesheet comes with", () => {
    const html = insertStyleLinks(
      PAGE,
      [{ href: "/a.css", attributes: { "data-vite-dev-id": "/app/a.css" } }],
      "data-test",
    )

    expect(html).toContain(
      '<link rel="stylesheet" href="/a.css" data-test data-vite-dev-id="/app/a.css">',
    )
  })

  it("replaces links with attributes of their own too", () => {
    const once = insertStyleLinks(
      PAGE,
      [{ href: "/a.css", attributes: { "data-vite-dev-id": "/app/a.css" } }],
      "data-test",
    )

    expect(insertStyleLinks(once, [], "data-test")).toBe(PAGE)
  })

  it("returns the page as it was when there is nothing to link", () => {
    expect(insertStyleLinks(PAGE, [], "data-test")).toBe(PAGE)
  })
})
