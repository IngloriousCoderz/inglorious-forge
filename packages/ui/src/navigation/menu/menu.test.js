import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Menu } from "."

describe("menu", () => {
  it("does not render when closed", () => {
    const container = document.createElement("div")

    render(Menu.render({ isOpen: false }), container)

    expect(container.querySelector(".iw-menu")).toBeNull()
  })

  it("renders items and dividers", () => {
    const container = document.createElement("div")

    render(
      Menu.render({
        isOpen: true,
        items: [{ label: "A" }, { hasDivider: true }],
      }),
      container,
    )

    expect(container.querySelector(".iw-menu-item")).not.toBeNull()
    expect(container.querySelector(".iw-menu-divider")).not.toBeNull()
  })

  it("fires onItemClick", () => {
    let value = null
    const container = document.createElement("div")

    render(
      Menu.render({
        isOpen: true,
        items: [{ label: "A", value: "a" }],
        onItemClick: (next) => (value = next),
      }),
      container,
    )

    container.querySelector(".iw-menu-item").click()
    expect(value).toBe("a")
  })
})
