import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { paper } from "."

describe("paper", () => {
  it("renders children", () => {
    const container = document.createElement("div")

    render(paper.render({ children: "Hello" }), container)

    expect(container.querySelector(".iw-paper").textContent.trim()).toBe(
      "Hello",
    )
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

  it("applies square and padding modifiers", () => {
    const container = document.createElement("div")

    render(paper.render({ square: true, padding: "lg" }), container)

    const root = container.querySelector(".iw-paper")
    expect(root.classList.contains("iw-paper-square")).toBe(true)
    expect(root.classList.contains("iw-paper-padding-lg")).toBe(true)
  })
})
