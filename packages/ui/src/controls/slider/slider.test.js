import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { slider } from "."

describe("slider", () => {
  it("renders range input with value", () => {
    const props = {
      id: "sl",
      value: 42,
      min: 10,
      max: 90,
      color: "info",
    }
    const container = document.createElement("div")

    render(slider.render(props), container)

    const input = container.querySelector('input[type="range"]')
    expect(input.value).toBe("42")
    expect(input.min).toBe("10")
    expect(input.max).toBe("90")
    expect(
      container
        .querySelector(".iw-slider")
        .classList.contains("iw-slider-info"),
    ).toBe(true)
  })

  it("dispatches change events", () => {
    let newValue = null
    const props = {
      id: "sl",
      value: 0,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(slider.render(props), container)

    const input = container.querySelector('input[type="range"]')
    input.value = "64"
    input.dispatchEvent(new Event("input"))

    expect(newValue).toBe(64)
  })
})
