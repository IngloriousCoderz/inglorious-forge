import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Chip } from "."

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

    render(Chip.render(props), container)

    container.querySelector(".iw-chip-remove").click()

    const element = container.querySelector(".iw-chip")
    expect(element.classList.contains("iw-chip-lg")).toBe(true)
    expect(element.classList.contains("iw-chip-warning")).toBe(true)
    expect(element.classList.contains("iw-chip-shape-square")).toBe(true)
    expect(isClicked).toBe(true)
  })

  it("shows an icon before the label", () => {
    const container = document.createElement("div")

    render(
      Chip.render({ icon: html`<svg></svg>`, children: "Paid" }),
      container,
    )

    expect(container.querySelector(".iw-chip-icon svg")).not.toBeNull()
  })

  it("is a toggle button when it can be selected", () => {
    let clicks = 0
    const container = document.createElement("div")

    render(
      Chip.render({
        children: "Vegan",
        isSelected: true,
        onClick: () => (clicks += 1),
      }),
      container,
    )

    const button = container.querySelector("button.iw-chip")
    expect(button.getAttribute("aria-pressed")).toBe("true")
    expect(button.classList.contains("iw-chip-selected")).toBe(true)
    expect(container.querySelector(".iw-chip-remove")).toBeNull()
    button.click()
    expect(clicks).toBe(1)
  })

  it("stays a plain label without isSelected", () => {
    const container = document.createElement("div")

    render(Chip.render({ children: "Tag" }), container)

    expect(container.querySelector("span.iw-chip")).not.toBeNull()
    expect(container.querySelector("[aria-pressed]")).toBeNull()
  })
})
