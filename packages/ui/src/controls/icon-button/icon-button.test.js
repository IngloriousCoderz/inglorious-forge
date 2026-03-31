import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { IconButton } from "."

describe("iconButton", () => {
  it("renders icon and label", () => {
    const props = { id: "ib", icon: "★", label: "Star" }
    const container = document.createElement("div")

    render(IconButton.render(props), container)

    expect(container.querySelector("button")).not.toBeNull()
    expect(
      container
        .querySelector(".iw-icon-button-content")
        .textContent.replace(/\s+/g, ""),
    ).toBe("★Star")
  })

  it("supports icon-only mode", () => {
    const props = {
      id: "ib",
      icon: "⚙",
      iconOnly: true,
      ariaLabel: "Settings",
    }
    const container = document.createElement("div")

    render(IconButton.render(props), container)

    expect(container.querySelector("button").textContent.trim()).toBe("⚙")
  })

  it("renders iconAfter and direction class", () => {
    const props = {
      id: "ib",
      icon: "★",
      label: "Star",
      iconAfter: "→",
      direction: "column",
    }
    const container = document.createElement("div")

    render(IconButton.render(props), container)

    const content = container.querySelector(".iw-icon-button-content")
    expect(content.classList.contains("iw-icon-button-content-column")).toBe(
      true,
    )
    expect(content.textContent.replace(/\s+/g, "")).toBe("★Star→")
  })

  it("passes button props through", () => {
    const props = {
      id: "ib",
      icon: "★",
      label: "Star",
      variant: "outline",
      color: "secondary",
      size: "lg",
      isDisabled: true,
      ariaLabel: "Star button",
    }
    const container = document.createElement("div")

    render(IconButton.render(props), container)

    const buttonElement = container.querySelector("button")
    expect(buttonElement.classList.contains("iw-button-outline")).toBe(true)
    expect(buttonElement.classList.contains("iw-button-secondary")).toBe(true)
    expect(buttonElement.classList.contains("iw-button-lg")).toBe(true)
    expect(buttonElement.disabled).toBe(true)
    expect(buttonElement.getAttribute("aria-label")).toBe("Star button")
  })

  describe("click handler", () => {
    it("dispatches click event on button click", () => {
      let isClicked = false
      const props = { icon: "★", onClick: () => (isClicked = true) }
      const container = document.createElement("div")

      render(IconButton.render(props), container)

      const buttonElement = container.querySelector("button")
      buttonElement.click()

      expect(isClicked).toBe(true)
    })
  })
})
