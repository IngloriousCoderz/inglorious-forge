import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { input } from "."

describe("input", () => {
  describe("render", () => {
    it("renders label and input", () => {
      const entity = { id: "email", name: "email", label: "Email" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const labelElement = container.querySelector("label")
      const inputElement = container.querySelector("input")
      expect(labelElement.textContent.trim()).toBe("Email")
      expect(inputElement.name).toBe("email")
    })

    it("applies size class", () => {
      const entity = { id: "field", size: "sm" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.classList.contains("iw-input-sm")).toBe(true)
    })

    it("applies error class and renders message", () => {
      const entity = { id: "field", error: "Required" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const inputElement = container.querySelector("input")
      const errorElement = container.querySelector(".iw-input-error-message")
      expect(inputElement.classList.contains("iw-input-error")).toBe(true)
      expect(errorElement.textContent).toBe("Required")
    })

    it("renders icons", () => {
      const entity = { id: "field", icon: "@", iconAfter: "✓" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const icons = container.querySelectorAll(".iw-input-icon")
      expect(icons.length).toBe(2)
      expect(icons[1].classList.contains("iw-input-icon-after")).toBe(true)
    })

    it("applies number class for numeric fields", () => {
      const entity = { id: "amount", inputType: "number", value: "42" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.classList.contains("iw-input-number")).toBe(true)
    })

    it("passes arbitrary attributes to native input", () => {
      const entity = {
        id: "amount",
        inputType: "number",
        value: "42",
        min: "0",
        max: "100",
        step: "0.5",
        "data-testid": "amount-input",
      }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.getAttribute("min")).toBe("0")
      expect(inputElement.getAttribute("max")).toBe("100")
      expect(inputElement.getAttribute("step")).toBe("0.5")
      expect(inputElement.getAttribute("data-testid")).toBe("amount-input")
    })
  })

  describe("events", () => {
    it("dispatches change, focus, and blur", () => {
      const entity = { id: "field", value: "" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(input.render(entity, api), container)

      const inputElement = container.querySelector("input")
      inputElement.value = "abc"
      inputElement.dispatchEvent(new Event("input"))
      inputElement.dispatchEvent(new Event("focus"))
      inputElement.dispatchEvent(new Event("blur"))

      expect(api.getEvents()).toEqual([
        { type: "#field:change", payload: "abc" },
        { type: "#field:focus" },
        { type: "#field:blur" },
      ])
    })
  })
})
