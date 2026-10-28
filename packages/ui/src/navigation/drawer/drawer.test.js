import { render } from "@inglorious/web/test"
import { afterEach, describe, expect, it, vi } from "vitest"

import { isPopoverOpen } from "../../../vitest.setup.js"
import { Drawer } from "."

describe("drawer", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("shows as a popover while open", async () => {
    const container = mount(Drawer.render({ isOpen: true, onClose() {} }))
    await settle()

    const drawer = container.querySelector("aside.iw-drawer")
    expect(drawer.getAttribute("popover")).toBe("auto")
    expect(isPopoverOpen(drawer)).toBe(true)
  })

  it("hides the popover when isOpen turns false, without reporting a close", async () => {
    const onClose = vi.fn()
    const container = mount(Drawer.render({ isOpen: true, onClose }))
    await settle()

    render(Drawer.render({ isOpen: false, onClose }), container)

    expect(isPopoverOpen(container.querySelector("aside"))).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
  })

  it("reports a dismissal the browser makes", async () => {
    const onClose = vi.fn()
    const container = mount(Drawer.render({ isOpen: true, onClose }))
    await settle()

    container.querySelector("aside").hidePopover()

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("is a manual popover without onClose, so the browser cannot dismiss it", () => {
    const container = mount(Drawer.render({ isOpen: true }))

    expect(container.querySelector("aside").getAttribute("popover")).toBe(
      "manual",
    )
  })

  it("never overlays when permanent", async () => {
    const container = mount(
      Drawer.render({ isOpen: true, variant: "permanent", onClose() {} }),
    )
    await settle()

    const drawer = container.querySelector("aside")
    expect(drawer.hasAttribute("popover")).toBe(false)
    expect(isPopoverOpen(drawer)).toBe(false)
  })

  it("does not overlay a responsive drawer where it docks", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener() {},
    }))
    vi.resetModules()
    const { Drawer: FreshDrawer } = await import(".")

    const container = mount(FreshDrawer.render({ isOpen: true, onClose() {} }))
    await settle()

    expect(isPopoverOpen(container.querySelector("aside"))).toBe(false)
    vi.unstubAllGlobals()
  })

  it("fires onCollapseToggle", () => {
    const onCollapseToggle = vi.fn()
    const container = mount(Drawer.render({ isOpen: true, onCollapseToggle }))

    container.querySelector(".iw-drawer-toggler").click()

    expect(onCollapseToggle).toHaveBeenCalledTimes(1)
  })

  it("names its buttons in the app's language", () => {
    const labels = {
      closeLabel: "Chiudi",
      collapseLabel: "Comprimi",
      expandLabel: "Espandi",
    }
    const container = mount(
      Drawer.render({
        isOpen: true,
        ...labels,
        onClose() {},
        onCollapseToggle() {},
      }),
    )
    const collapsed = mount(
      Drawer.render({ isCollapsed: true, ...labels, onCollapseToggle() {} }),
    )

    const label = (root, selector) =>
      root.querySelector(selector).getAttribute("aria-label")
    expect(label(container, ".iw-drawer-close")).toBe("Chiudi")
    expect(label(container, ".iw-drawer-toggler")).toBe("Comprimi")
    expect(label(collapsed, ".iw-drawer-toggler")).toBe("Espandi")
  })
})

function mount(template) {
  const container = document.createElement("div")
  document.body.append(container)
  render(template, container)
  return container
}

function settle() {
  return Promise.resolve()
}
