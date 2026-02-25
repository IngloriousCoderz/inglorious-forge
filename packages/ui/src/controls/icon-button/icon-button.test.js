import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { iconButton } from "."

describe("iconButton", () => {
  it("renders icon and label", () => {
    const entity = { id: "ib", icon: "★", label: "Star" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(iconButton.render(entity, api), container)

    expect(container.querySelector("button")).not.toBeNull()
    expect(
      container
        .querySelector(".iw-icon-button-content")
        .textContent.replace(/\s+/g, ""),
    ).toBe("★Star")
  })

  it("supports icon-only mode", () => {
    const entity = {
      id: "ib",
      icon: "⚙",
      iconOnly: true,
      ariaLabel: "Settings",
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(iconButton.render(entity, api), container)

    expect(container.querySelector("button").textContent.trim()).toBe("⚙")
  })
})
