import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { dialog } from "."

describe("dialog", () => {
  it("renders when open", () => {
    const props = { isOpen: true, title: "Hello", description: "Details" }
    const container = document.createElement("div")

    render(dialog.render(props), container)

    expect(container.querySelector(".iw-dialog")).not.toBeNull()
    expect(container.querySelector(".iw-dialog-title").textContent).toBe(
      "Hello",
    )
  })

  it("does not render when closed", () => {
    const props = { isOpen: false }
    const container = document.createElement("div")

    render(dialog.render(props), container)

    expect(container.querySelector(".iw-dialog")).toBeNull()
  })

  it("dispatches close on backdrop click", () => {
    let closed = false
    const props = { isOpen: true, onClose: () => (closed = true) }
    const container = document.createElement("div")

    render(dialog.render(props), container)

    container.querySelector(".iw-dialog-backdrop").click()
    expect(closed).toBe(true)
  })

  it("prefers onBackdropClick over onClose", () => {
    let closeCount = 0
    let backdropCount = 0
    const props = {
      isOpen: true,
      onClose: () => closeCount++,
      onBackdropClick: () => backdropCount++,
    }
    const container = document.createElement("div")

    render(dialog.render(props), container)

    container.querySelector(".iw-dialog-backdrop").click()

    expect(backdropCount).toBe(1)
    expect(closeCount).toBe(0)
  })
})
