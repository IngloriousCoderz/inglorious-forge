import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { checkbox } from "."

describe("checkbox", () => {
  it("renders label and checkbox", () => {
    const props = {
      id: "cb",
      label: "Accept",
      checked: true,
      color: "warning",
    }
    const container = document.createElement("div")

    render(checkbox.render(props), container)

    expect(container.querySelector(".iw-checkbox-label").textContent).toBe(
      "Accept",
    )
    expect(container.querySelector("input").checked).toBe(true)
    expect(
      container
        .querySelector(".iw-checkbox")
        .classList.contains("iw-checkbox-warning"),
    ).toBe(true)
  })

  it("dispatches change event", () => {
    let isChecked = false
    const props = {
      id: "cb",
      checked: false,
      onChange: (value) => (isChecked = value),
    }
    const container = document.createElement("div")

    render(checkbox.render(props), container)

    const input = container.querySelector("input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(isChecked).toBe(true)
  })
})
