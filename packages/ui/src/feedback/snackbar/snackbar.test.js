import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { snackbar } from "."

describe("snackbar", () => {
  it("renders when open", () => {
    const props = { isOpen: true, message: "Saved" }
    const container = document.createElement("div")

    render(snackbar.render(props), container)

    expect(container.querySelector(".iw-snackbar-message").textContent).toBe(
      "Saved",
    )
  })

  it("does not render when closed", () => {
    const props = { isOpen: false, message: "Saved" }
    const container = document.createElement("div")

    render(snackbar.render(props), container)

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

    render(snackbar.render(props), container)

    container.querySelector(".iw-snackbar-close").click()
    expect(closed).toBe(true)
  })
})
