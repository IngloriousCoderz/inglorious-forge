import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { chip } from "."

describe("chip", () => {
  it("renders and emits remove", () => {
    let isClicked = null
    const props = {
      id: "chip",
      children: "Tag",
      isRemovable: true,
      color: "warning",
      size: "lg",
      shape: "square",
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(chip.render(props), container)

    container.querySelector(".iw-chip-remove").click()

    const element = container.querySelector(".iw-chip")
    expect(element.classList.contains("iw-chip-lg")).toBe(true)
    expect(element.classList.contains("iw-chip-warning")).toBe(true)
    expect(element.classList.contains("iw-chip-shape-square")).toBe(true)
    expect(isClicked).toBe(true)
  })
})
