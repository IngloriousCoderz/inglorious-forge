import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { drawer } from "."

describe("drawer", () => {
  it("does not render temporary drawer when closed", () => {
    const container = document.createElement("div")

    render(drawer.render({ isOpen: false, variant: "temporary" }), container)

    expect(container.querySelector(".iw-drawer")).toBeNull()
  })

  it("renders persistent drawer when closed", () => {
    const container = document.createElement("div")

    render(drawer.render({ isOpen: false, variant: "persistent" }), container)

    expect(container.querySelector(".iw-drawer-persistent")).not.toBeNull()
  })

  it("fires onClose from the backdrop", () => {
    let closed = false
    const container = document.createElement("div")

    render(
      drawer.render({ isOpen: true, onClose: () => (closed = true) }),
      container,
    )

    container.querySelector(".iw-drawer-backdrop").click()
    expect(closed).toBe(true)
  })

  it("renders responsive drawer classes", () => {
    const container = document.createElement("div")

    render(
      drawer.render({
        isOpen: true,
        variant: "responsive",
        breakpoint: "lg",
        isCollapsed: true,
      }),
      container,
    )

    const element = container.querySelector(".iw-drawer")
    expect(element.classList.contains("iw-drawer-responsive")).toBe(true)
    expect(element.classList.contains("iw-drawer-breakpoint-lg")).toBe(true)
    expect(element.classList.contains("iw-drawer-collapsed")).toBe(true)
  })
})
