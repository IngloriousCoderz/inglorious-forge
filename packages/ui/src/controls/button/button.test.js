import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { button } from "."

describe("button", () => {
  const type = augmentType(button)

  describe("render", () => {
    it("renders a button with label", () => {
      const entity = { id: "btn", label: "Click me" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.textContent.trim()).toBe("Click me")
    })

    it("renders with default classes", () => {
      const entity = { id: "btn", label: "Test" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button")).toBe(true)
    })

    it("applies size class for sm", () => {
      const entity = { id: "btn", label: "Small", size: "sm" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-sm")).toBe(true)
    })

    it("applies size class for lg", () => {
      const entity = { id: "btn", label: "Large", size: "lg" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-lg")).toBe(true)
    })

    it("applies variant class for outline", () => {
      const entity = { id: "btn", label: "Outline", variant: "outline" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-outline")).toBe(true)
    })

    it("applies variant class for ghost", () => {
      const entity = { id: "btn", label: "Ghost", variant: "ghost" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-ghost")).toBe(true)
    })

    it("applies color class for secondary", () => {
      const entity = { id: "btn", label: "Secondary", color: "secondary" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-secondary")).toBe(true)
    })

    it("applies color class for success", () => {
      const entity = { id: "btn", label: "Success", color: "success" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-success")).toBe(true)
    })

    it("applies disabled attribute", () => {
      const entity = { id: "btn", label: "Disabled", disabled: true }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.hasAttribute("disabled")).toBe(true)
    })

    it("applies full width class", () => {
      const entity = { id: "btn", label: "Full Width", fullWidth: true }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-full-width")).toBe(
        true,
      )
    })

    it("sets button type attribute", () => {
      const entity = { id: "btn", label: "Submit", type: "submit" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.type).toBe("submit")
    })

    it("renders with icon", () => {
      const entity = { id: "btn", label: "With Icon", icon: "★" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const icon = container.querySelector(".iw-button-icon")
      expect(icon.textContent).toBe("★")
    })

    it("renders with iconAfter", () => {
      const entity = { id: "btn", label: "With Icon After", iconAfter: "→" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const icon = container.querySelector(".iw-button-icon")
      expect(icon.textContent).toBe("→")
    })
  })

  describe("click handler", () => {
    it("dispatches click event on button click", () => {
      const entity = { id: "btn", label: "Click me" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(type.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      buttonElement.click()

      expect(api.getEvents()).toEqual([{ type: "#btn:click" }])
    })
  })
})
