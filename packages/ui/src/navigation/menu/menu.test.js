import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { isPopoverOpen } from "../../../vitest.setup.js"
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

  describe("with a trigger", () => {
    it("renders a trigger that commands the menu popover", () => {
      const container = document.createElement("div")

      render(Menu.render({ id: "actions", trigger: "More" }), container)

      const trigger = container.querySelector(".iw-button")
      const menu = container.querySelector(".iw-menu")
      expect(trigger.getAttribute("commandfor")).toBe("actions")
      expect(trigger.getAttribute("aria-haspopup")).toBe("menu")
      expect(trigger.hasAttribute("aria-pressed")).toBe(false)
      expect(menu.id).toBe("actions")
      expect(menu.getAttribute("popover")).toBe("auto")
    })

    it("anchors the menu to its trigger", () => {
      const container = document.createElement("div")

      render(Menu.render({ id: "actions", trigger: "More" }), container)

      const trigger = container.querySelector(".iw-button")
      const menu = container.querySelector(".iw-menu")
      expect(trigger.getAttribute("style")).toContain(
        "anchor-name: --iw-anchor-actions",
      )
      expect(menu.getAttribute("style")).toContain(
        "position-anchor: --iw-anchor-actions",
      )
    })

    it("stays in the page while closed", () => {
      const container = document.createElement("div")

      render(Menu.render({ id: "actions", trigger: "More" }), container)

      expect(container.querySelector(".iw-menu")).not.toBeNull()
    })

    it("follows isOpen and reports the browser's changes", async () => {
      const onToggle = vi.fn()
      const container = document.createElement("div")
      document.body.append(container)

      render(
        Menu.render({ id: "actions", trigger: "More", isOpen: true, onToggle }),
        container,
      )
      await Promise.resolve()
      const menu = container.querySelector(".iw-menu")
      expect(isPopoverOpen(menu)).toBe(true)

      menu.hidePopover()
      expect(onToggle).toHaveBeenCalledWith(false)

      render(
        Menu.render({
          id: "actions",
          trigger: "More",
          isOpen: false,
          onToggle,
        }),
        container,
      )
      menu.showPopover()
      expect(onToggle).toHaveBeenLastCalledWith(true)
      container.remove()
    })

    it("hides the popover from each item", () => {
      const container = document.createElement("div")

      render(
        Menu.render({
          id: "actions",
          trigger: "More",
          items: [{ label: "A" }],
        }),
        container,
      )

      const item = container.querySelector(".iw-menu-item")
      expect(item.getAttribute("commandfor")).toBe("actions")
      expect(item.getAttribute("command")).toBe("hide-popover")
    })
  })
})
