import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { iconButton } from "."

describe("iconButton", () => {
  it("renders icon and label", () => {
    const props = { id: "ib", icon: "★", label: "Star" }
    const container = document.createElement("div")

    render(iconButton.render(props), container)

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

    render(iconButton.render(props), container)

    expect(container.querySelector("button").textContent.trim()).toBe("⚙")
  })

  describe("click handler", () => {
    it("dispatches click event on button click", () => {
      let isClicked = false
      const props = { icon: "★", onClick: () => (isClicked = true) }
      const container = document.createElement("div")

      render(iconButton.render(props), container)

      const buttonElement = container.querySelector("button")
      buttonElement.click()

      expect(isClicked).toBe(true)
    })
  })
})
