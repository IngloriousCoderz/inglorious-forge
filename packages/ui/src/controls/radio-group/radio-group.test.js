import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { radioGroup } from "."

describe("radioGroup", () => {
  it("renders options and selected state", () => {
    const props = {
      id: "rg",
      value: "b",
      color: "error",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(radioGroup.render(props), container)

    const radios = container.querySelectorAll('input[type="radio"]')
    expect(radios.length).toBe(2)
    expect(radios[1].checked).toBe(true)
    expect(
      container
        .querySelector(".iw-radio-group")
        .classList.contains("iw-radio-group-error"),
    ).toBe(true)
  })

  it("dispatches change event", () => {
    let newValue = null
    const props = {
      id: "rg",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(radioGroup.render(props), container)

    const radio = container.querySelector('input[value="b"]')
    radio.checked = true
    radio.dispatchEvent(new Event("change"))

    expect(newValue).toBe("b")
  })

  it("renders group label and disables options", () => {
    const props = {
      id: "rg",
      label: "Status",
      disabled: true,
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b", disabled: true },
      ],
    }
    const container = document.createElement("div")

    render(radioGroup.render(props), container)

    expect(container.querySelector(".iw-radio-group-label").textContent).toBe(
      "Status",
    )
    const radios = container.querySelectorAll('input[type="radio"]')
    expect(radios[0].disabled).toBe(true)
    expect(radios[1].disabled).toBe(true)
  })
})
