import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { input } from "."

describe("input", () => {
  describe("render", () => {
    it("renders label and input", () => {
      const props = { name: "email", label: "Email" }
      const container = document.createElement("div")

      render(input.render(props), container)

      const labelElement = container.querySelector("label")
      const inputElement = container.querySelector("input")
      expect(labelElement.textContent.trim()).toBe("Email")
      expect(inputElement.name).toBe("email")
    })

    it("applies size class", () => {
      const props = { size: "sm" }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.classList.contains("iw-input-sm")).toBe(true)
    })

    it("applies error class and renders message", () => {
      const props = { error: "Required" }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      const errorElement = container.querySelector(".iw-input-error-message")
      expect(inputElement.classList.contains("iw-input-error")).toBe(true)
      expect(errorElement.textContent).toBe("Required")
    })

    it("renders hint when no error is provided", () => {
      const props = { hint: "Helpful text" }
      const container = document.createElement("div")

      render(input.render(props), container)

      const hintElement = container.querySelector(".iw-input-hint")
      expect(hintElement.textContent).toBe("Helpful text")
    })

    it("prioritizes error over hint", () => {
      const props = { error: "Required", hint: "Helpful text" }
      const container = document.createElement("div")

      render(input.render(props), container)

      expect(container.querySelector(".iw-input-error-message")).not.toBeNull()
      expect(container.querySelector(".iw-input-hint")).toBeNull()
    })

    it("renders icons", () => {
      const props = { icon: "@", iconAfter: "✓" }
      const container = document.createElement("div")

      render(input.render(props), container)

      const icons = container.querySelectorAll(".iw-input-icon")
      expect(icons.length).toBe(2)
      expect(icons[1].classList.contains("iw-input-icon-after")).toBe(true)
    })

    it("applies number class for numeric fields", () => {
      const props = { inputType: "number", value: "42" }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.classList.contains("iw-input-number")).toBe(true)
    })

    it("renders required indicator and attributes", () => {
      const props = { id: "email", label: "Email", isRequired: true }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.hasAttribute("required")).toBe(true)
      expect(container.querySelector(".iw-input-required")).not.toBeNull()
    })

    it("applies disabled, readonly, and fullWidth state", () => {
      const props = {
        isDisabled: true,
        isReadOnly: true,
        isFullWidth: true,
      }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.hasAttribute("disabled")).toBe(true)
      expect(inputElement.hasAttribute("readonly")).toBe(true)
      expect(
        container
          .querySelector(".iw-input-field")
          .classList.contains("iw-input-full-width"),
      ).toBe(true)
    })

    it("passes arbitrary attributes to native input", () => {
      const props = {
        inputType: "number",
        value: "42",
        min: "0",
        max: "100",
        step: "0.5",
        "data-testid": "amount-input",
      }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.getAttribute("min")).toBe("0")
      expect(inputElement.getAttribute("max")).toBe("100")
      expect(inputElement.getAttribute("step")).toBe("0.5")
      expect(inputElement.getAttribute("data-testid")).toBe("amount-input")
    })
  })

  describe("events", () => {
    it("dispatches change event", () => {
      let newValue = null
      const props = {
        id: "field",
        value: "",
        onChange: (value) => (newValue = value),
      }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      inputElement.value = "abc"
      inputElement.dispatchEvent(new Event("input"))

      expect(newValue).toBe("abc")
    })

    it("dispatches blur and focus events", () => {
      let blurCount = 0
      let focusCount = 0
      const props = {
        onBlur: () => (blurCount += 1),
        onFocus: () => (focusCount += 1),
      }
      const container = document.createElement("div")

      render(input.render(props), container)

      const inputElement = container.querySelector("input")
      inputElement.dispatchEvent(new Event("focus"))
      inputElement.dispatchEvent(new Event("blur"))

      expect(focusCount).toBe(1)
      expect(blurCount).toBe(1)
    })
  })
})
