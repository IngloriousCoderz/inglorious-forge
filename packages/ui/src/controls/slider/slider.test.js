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

  it("renders label and hides value when showValue is false", () => {
    const props = {
      id: "sl",
      label: "Volume",
      isValueVisible: false,
    }
    const container = document.createElement("div")

    render(slider.render(props), container)

    expect(container.querySelector(".iw-slider-header label").textContent).toBe(
      "Volume",
    )
    expect(container.querySelector(".iw-slider-value")).toBeNull()
  })

  it("applies full width and disabled attributes", () => {
    const props = {
      id: "sl",
      isFullWidth: true,
      isDisabled: true,
      step: 5,
    }
    const container = document.createElement("div")

    render(slider.render(props), container)

    const root = container.querySelector(".iw-slider")
    const input = container.querySelector('input[type="range"]')
    expect(root.classList.contains("iw-slider-full-width")).toBe(true)
    expect(input.disabled).toBe(true)
    expect(input.step).toBe("5")
  })

  it("sets name and id on range input", () => {
    const props = { id: "slider", name: "volume" }
    const container = document.createElement("div")

    render(slider.render(props), container)

    const input = container.querySelector('input[type="range"]')
    expect(input.id).toBe("slider")
    expect(input.name).toBe("volume")
  })
})
