import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { drawer } from "."

describe("drawer", () => {
  it("fires onClose from the backdrop", () => {
    let isOpen = true
    const container = document.createElement("div")

    render(
      drawer.render({ isOpen, onClose: () => (isOpen = false) }),
      container,
    )

    container.querySelector(".iw-drawer-backdrop").click()
    expect(isOpen).toBe(false)
  })

  it("fires onCollapseToggle", () => {
    let isCollapsed = false
    const container = document.createElement("div")

    render(
      drawer.render({
        isOpen: true,
        isCollapsed,
        onCollapseToggle: () => (isCollapsed = true),
      }),
      container,
    )

    container.querySelector(".iw-drawer-toggler").click()
    expect(isCollapsed).toBe(true)
  })
})
