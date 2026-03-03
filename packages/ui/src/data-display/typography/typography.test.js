import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { typography } from "."

describe("typography", () => {
  it("renders heading variant", () => {
    const props = { id: "typo", variant: "h2", children: "Heading" }
    const container = document.createElement("div")

    render(typography.render(props), container)

    expect(
      container.querySelector(".iw-typography-h2").textContent.trim(),
    ).toBe("Heading")
  })

  it("applies align, noWrap, and gutterBottom classes", () => {
    const props = {
      id: "typo",
      variant: "body",
      align: "center",
      noWrap: true,
      gutterBottom: true,
      children: "Body",
    }
    const container = document.createElement("div")

    render(typography.render(props), container)

    const root = container.querySelector(".iw-typography")
    expect(root.classList.contains("iw-typography-align-center")).toBe(true)
    expect(root.classList.contains("iw-typography-nowrap")).toBe(true)
    expect(root.classList.contains("iw-typography-gutter-bottom")).toBe(true)
  })

  it("applies weight and color styles", () => {
    const props = {
      id: "typo",
      variant: "caption",
      weight: 600,
      color: "tomato",
      children: "Caption",
    }
    const container = document.createElement("div")

    render(typography.render(props), container)

    const element = container.querySelector(".iw-typography")
    const style = element.getAttribute("style")
    expect(style).toContain("font-weight: 600")
    expect(style).toContain("color: tomato")
  })
})
