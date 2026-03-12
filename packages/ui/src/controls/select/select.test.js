import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { select } from "."

describe("select", () => {
  it("renders with selected value", () => {
    const props = {
      value: "b",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(select.render(props), container)

    expect(container.querySelector(".iw-select").value).toBe("b")
  })

  it("supports multiple selection and disabled state", () => {
    const props = {
      isMulti: true,
      isDisabled: true,
      options: ["a", "b"],
    }
    const container = document.createElement("div")

    render(select.render(props), container)

    const selectElement = container.querySelector("select")
    expect(selectElement.multiple).toBe(true)
    expect(selectElement.disabled).toBe(true)
  })

  it("applies size and fullWidth classes", () => {
    const props = { size: "lg", isFullWidth: true, options: ["a", "b"] }
    const container = document.createElement("div")

    render(select.render(props), container)

    const selectElement = container.querySelector(".iw-select")
    expect(selectElement.classList.contains("iw-select-lg")).toBe(true)
    expect(selectElement.classList.contains("iw-select-full-width")).toBe(true)
  })

  it("respects disabled options", () => {
    const props = {
      options: [
        { label: "A", value: "a", isDisabled: true },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(select.render(props), container)

    const option = container.querySelector('option[value="a"]')
    expect(option.disabled).toBe(true)
  })

  describe("events", () => {
    it("dispatches change event", () => {
      let newValue = null
      const props = {
        value: "b",
        options: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
        onChange: (value) => (newValue = value),
      }
      const container = document.createElement("div")

      render(select.render(props), container)

      const selectElement = container.querySelector("select")
      selectElement.value = "a"
      selectElement.dispatchEvent(new Event("change"))

      expect(newValue).toBe("a")
    })

    it("dispatches blur and focus events", () => {
      let blurCount = 0
      let focusCount = 0
      const props = {
        options: ["a", "b"],
        onBlur: () => (blurCount += 1),
        onFocus: () => (focusCount += 1),
      }
      const container = document.createElement("div")

      render(select.render(props), container)

      const selectElement = container.querySelector("select")
      selectElement.dispatchEvent(new Event("focus"))
      selectElement.dispatchEvent(new Event("blur"))

      expect(focusCount).toBe(1)
      expect(blurCount).toBe(1)
    })
  })
})
