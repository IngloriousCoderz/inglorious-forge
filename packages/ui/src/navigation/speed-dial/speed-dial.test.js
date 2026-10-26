import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { isPopoverOpen } from "../../../vitest.setup.js"
import { SpeedDial } from "."

describe("speedDial", () => {
  it("renders trigger", () => {
    const container = document.createElement("div")

    render(SpeedDial.render({}), container)

    expect(container.querySelector(".iw-speed-dial-trigger")).not.toBeNull()
  })

  it("renders actions in a popover the trigger commands", async () => {
    const container = document.createElement("div")

    render(SpeedDial.render({ actions: [{ label: "A" }] }), container)
    await Promise.resolve()

    const trigger = container.querySelector(".iw-speed-dial-trigger")
    const actions = container.querySelector(".iw-speed-dial-actions")
    expect(actions.getAttribute("popover")).toBe("auto")
    expect(trigger.getAttribute("command")).toBe("toggle-popover")
    expect(trigger.commandForElement).toBe(actions)
    expect(
      container.querySelector(".iw-speed-dial-action").commandForElement,
    ).toBe(actions)
  })

  it("follows isOpen and reports the browser's changes", async () => {
    const onToggle = vi.fn()
    const container = document.createElement("div")
    document.body.append(container)

    render(SpeedDial.render({ isOpen: true, onToggle }), container)
    await Promise.resolve()
    const actions = container.querySelector(".iw-speed-dial-actions")
    expect(isPopoverOpen(actions)).toBe(true)

    actions.hidePopover()
    expect(onToggle).toHaveBeenCalledWith(false)
    container.remove()
  })

  it("renders actions when open", () => {
    const container = document.createElement("div")

    render(
      SpeedDial.render({ isOpen: true, actions: [{ label: "A" }] }),
      container,
    )

    expect(container.querySelector(".iw-speed-dial-action")).not.toBeNull()
  })
})
