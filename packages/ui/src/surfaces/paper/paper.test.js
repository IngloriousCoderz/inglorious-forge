import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { paper } from "."

describe("paper", () => {
  it("renders children", () => {
    const container = document.createElement("div")

    render(paper.render({ element: "section", children: "Hello" }), container)

    expect(container.querySelector(".iw-paper").textContent.trim()).toBe(
      "Hello",
    )
    expect(container.querySelector(".iw-paper").tagName).toBe("SECTION")
  })

  it("applies outlined variant", () => {
    const container = document.createElement("div")

    render(paper.render({ variant: "outlined" }), container)

    expect(
      container
        .querySelector(".iw-paper")
        .classList.contains("iw-paper-outlined"),
    ).toBe(true)
  })

  it("applies radius and padding modifiers", () => {
    const container = document.createElement("div")

    render(paper.render({ radius: "none", padding: "lg" }), container)

    const root = container.querySelector(".iw-paper")
    expect(root.classList.contains("iw-paper-radius-none")).toBe(true)
    expect(root.classList.contains("iw-paper-padding-lg")).toBe(true)
  })
})
