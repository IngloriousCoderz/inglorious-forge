import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { isPopoverOpen } from "../../../vitest.setup.js"
import { Snackbar } from "."

describe("snackbar", () => {
  it("renders when open", () => {
    const props = { isOpen: true, message: "Saved" }
    const container = document.createElement("div")

    render(Snackbar.render(props), container)

    expect(container.querySelector(".iw-snackbar-message").textContent).toBe(
      "Saved",
    )
  })

  it("shows as a manual popover", async () => {
    const container = document.createElement("div")
    document.body.append(container)

    render(Snackbar.render({ isOpen: true, message: "Saved" }), container)
    await Promise.resolve()

    const snackbar = container.querySelector(".iw-snackbar")
    expect(snackbar.getAttribute("popover")).toBe("manual")
    expect(isPopoverOpen(snackbar)).toBe(true)
    container.remove()
  })

  it("does not render when closed", () => {
    const props = { isOpen: false, message: "Saved" }
    const container = document.createElement("div")

    render(Snackbar.render(props), container)

    expect(container.querySelector(".iw-snackbar")).toBeNull()
  })

  it("dispatches close handler", () => {
    let closed = false
    const props = {
      isOpen: true,
      message: "Saved",
      onClose: () => (closed = true),
    }
    const container = document.createElement("div")

    render(Snackbar.render(props), container)

    container.querySelector(".iw-snackbar-close").click()
    expect(closed).toBe(true)
  })

  it("centers at the bottom", () => {
    const props = { isOpen: true, message: "Saved", position: "bottom-center" }
    const container = document.createElement("div")

    render(Snackbar.render(props), container)

    expect(container.querySelector(".iw-snackbar-bottom-center")).not.toBeNull()
  })

  it("has no close button without a close handler", () => {
    const props = { isOpen: true, message: "Saved" }
    const container = document.createElement("div")

    render(Snackbar.render(props), container)

    expect(container.querySelector(".iw-snackbar-close")).toBeNull()
  })
})
