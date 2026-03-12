import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { container } from "."

describe("container", () => {
  it("renders children", () => {
    const host = document.createElement("div")

    render(container.render({ element: "section", children: "Hello" }), host)

    const root = host.querySelector(".iw-container")
    expect(root.textContent).toContain("Hello")
    expect(root.tagName).toBe("SECTION")
  })

  it("applies fixed and gutter classes", () => {
    const host = document.createElement("div")

    render(container.render({ isFixed: true, isGutterless: true }), host)

    const root = host.querySelector(".iw-container")
    expect(root.classList.contains("iw-container-fixed")).toBe(true)
    expect(root.classList.contains("iw-container-no-gutters")).toBe(true)
  })

  it("maps numeric maxWidth to px style", () => {
    const host = document.createElement("div")

    render(container.render({ maxWidth: 960 }), host)

    expect(host.querySelector(".iw-container").style.maxWidth).toBe("960px")
  })

  it("allows full-width mode with maxWidth false", () => {
    const host = document.createElement("div")

    render(container.render({ maxWidth: false }), host)

    expect(host.querySelector(".iw-container").style.maxWidth).toBe("none")
  })
})
