import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { checkbox } from "."

describe("checkbox", () => {
  it("renders label and checkbox", () => {
    const props = {
      id: "cb",
      label: "Accept",
      isChecked: true,
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
      isChecked: false,
      onChange: (value) => (isChecked = value),
    }
    const container = document.createElement("div")

    render(checkbox.render(props), container)

    const input = container.querySelector("input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(isChecked).toBe(true)
  })

  it("applies size and disabled/required state", () => {
    const props = {
      id: "cb",
      name: "terms",
      size: "lg",
      isDisabled: true,
      isRequired: true,
    }
    const container = document.createElement("div")

    render(checkbox.render(props), container)

    const root = container.querySelector(".iw-checkbox")
    const input = container.querySelector("input")
    expect(root.classList.contains("iw-checkbox-lg")).toBe(true)
    expect(input.disabled).toBe(true)
    expect(input.required).toBe(true)
    expect(input.name).toBe("terms")
    expect(input.id).toBe("cb")
  })
})
