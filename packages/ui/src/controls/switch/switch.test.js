import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { switchControl } from "."

describe("switchControl", () => {
  it("renders checked state", () => {
    const props = {
      id: "sw",
      checked: true,
      label: "Enabled",
      color: "success",
    }
    const container = document.createElement("div")

    render(switchControl.render(props), container)

    expect(container.querySelector(".iw-switch-input").checked).toBe(true)
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
      checked: false,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(switchControl.render(props), container)

    const input = container.querySelector(".iw-switch-input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(newValue).toBe(true)
  })
})
