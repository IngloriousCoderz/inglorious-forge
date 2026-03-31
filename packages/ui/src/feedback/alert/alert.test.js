import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Alert } from "."

describe("alert", () => {
  it("renders title and description", () => {
    const props = { title: "Hello", description: "Details" }
    const container = document.createElement("div")

    render(Alert.render(props), container)

    expect(container.querySelector(".iw-alert-title").textContent).toBe("Hello")
    expect(container.querySelector(".iw-alert-description").textContent).toBe(
      "Details",
    )
  })

  it("applies severity and variant classes", () => {
    const props = { severity: "warning", variant: "outlined" }
    const container = document.createElement("div")

    render(Alert.render(props), container)

    const root = container.querySelector(".iw-alert")
    expect(root.classList.contains("iw-alert-warning")).toBe(true)
    expect(root.classList.contains("iw-alert-outlined")).toBe(true)
  })

  it("uses the filled class by default", () => {
    const container = document.createElement("div")

    render(Alert.render({}), container)

    const root = container.querySelector(".iw-alert")
    expect(root.classList.contains("iw-alert-filled")).toBe(true)
  })

  it("dispatches close handler", () => {
    let closed = false
    const props = { onClose: () => (closed = true) }
    const container = document.createElement("div")

    render(Alert.render(props), container)

    container.querySelector(".iw-alert-close").click()
    expect(closed).toBe(true)
  })

  it("renders action and close inside trailing slot", () => {
    const container = document.createElement("div")

    render(Alert.render({ action: "Undo", onClose: () => {} }), container)

    const trailing = container.querySelector(".iw-alert-trailing")
    expect(trailing).not.toBeNull()
    expect(trailing.querySelector(".iw-alert-action").textContent).toBe("Undo")
    expect(trailing.querySelector(".iw-alert-close")).not.toBeNull()
  })
})
