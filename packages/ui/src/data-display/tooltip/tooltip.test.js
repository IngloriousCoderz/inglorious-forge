import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Tooltip } from "."

describe("tooltip", () => {
  it("renders tooltip bubble", () => {
    const props = {
      id: "tip",
      children: "Hover",
      content: "Details",
      size: "lg",
    }
    const container = document.createElement("div")

    render(Tooltip.render(props), container)

    expect(
      container.querySelector(".iw-tooltip-bubble").textContent.trim(),
    ).toBe("Details")
    expect(
      container
        .querySelector(".iw-tooltip")
        .classList.contains("iw-tooltip-size-lg"),
    ).toBe(true)
  })

  it("applies position, open, className, maxWidth, and click handler", () => {
    let isClicked = false
    const props = {
      id: "tip",
      children: "Hover",
      content: "Details",
      position: "bottom",
      isOpen: true,
      maxWidth: "10rem",
      className: "extra-class",
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(Tooltip.render(props), container)

    const root = container.querySelector(".iw-tooltip")
    expect(root.classList.contains("iw-tooltip-bottom")).toBe(true)
    expect(root.classList.contains("iw-tooltip-open")).toBe(true)
    expect(root.classList.contains("extra-class")).toBe(true)
    expect(
      container.querySelector(".iw-tooltip-bubble").getAttribute("style"),
    ).toContain("max-width: 10rem")
    root.click()
    expect(isClicked).toBe(true)
  })
})
