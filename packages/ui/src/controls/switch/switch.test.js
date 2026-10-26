import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Switch } from "."

describe("switch", () => {
  it("renders checked state", () => {
    const props = {
      id: "sw",
      isChecked: true,
      label: "Enabled",
      color: "success",
    }
    const container = document.createElement("div")

    render(Switch.render(props), container)

    expect(container.querySelector(".iw-switch-input").checked).toBe(true)
    expect(
      container.querySelector(".iw-switch-input").getAttribute("role"),
    ).toBe("switch")
    expect(container.querySelector(".iw-switch-label").textContent).toBe(
      "Enabled",
    )
    expect(
      container
        .querySelector(".iw-switch")
        .classList.contains("iw-switch-success"),
    ).toBe(true)
  })

  it("dispatches change event", () => {
    let newValue = null
    const props = {
      id: "sw",
      isChecked: false,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(Switch.render(props), container)

    const input = container.querySelector(".iw-switch-input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(newValue).toBe(true)
  })

  it("applies size, disabled state, and optional label", () => {
    const props = {
      id: "sw",
      name: "toggle",
      size: "lg",
      isDisabled: true,
      label: "",
    }
    const container = document.createElement("div")

    render(Switch.render(props), container)

    const root = container.querySelector(".iw-switch")
    const input = container.querySelector(".iw-switch-input")
    expect(root.classList.contains("iw-switch-lg")).toBe(true)
    expect(root.classList.contains("iw-switch-disabled")).toBe(true)
    expect(input.disabled).toBe(true)
    expect(input.name).toBe("toggle")
    expect(input.id).toBe("sw")
    expect(container.querySelector(".iw-switch-label")).toBeNull()
  })
})

describe("switch without an id", () => {
  it("toggles from its label", () => {
    let newValue = null
    const container = document.createElement("div")

    render(
      Switch.render({
        label: "Online",
        onChange: (value) => (newValue = value),
      }),
      container,
    )

    const label = container.querySelector(".iw-switch")
    expect(label.hasAttribute("for")).toBe(false)
    expect(container.querySelector(".iw-switch-input").hasAttribute("id")).toBe(
      false,
    )

    // A label only clicks through to its control once it is in the document.
    document.body.append(container)
    container.querySelector(".iw-switch-label").click()
    container.remove()

    expect(newValue).toBe(true)
  })
})
