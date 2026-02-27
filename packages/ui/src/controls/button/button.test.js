import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { button } from "."

describe("button", () => {
  describe("render", () => {
    it("renders a button with children", () => {
      const entity = { id: "btn", children: "Click me" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.textContent.trim()).toBe("Click me")
    })

    it("renders with default classes", () => {
      const entity = { id: "btn", children: "Test" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button")).toBe(true)
    })

    it("applies size class for sm", () => {
      const entity = { id: "btn", children: "Small", size: "sm" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-sm")).toBe(true)
    })

    it("applies size class for lg", () => {
      const entity = { id: "btn", children: "Large", size: "lg" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-lg")).toBe(true)
    })

    it("applies shape class for round", () => {
      const entity = { id: "btn", children: "+", shape: "round" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-shape-round")).toBe(
        true,
      )
    })

    it("applies variant class for outline", () => {
      const entity = { id: "btn", children: "Outline", variant: "outline" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-outline")).toBe(true)
    })

    it("applies variant class for ghost", () => {
      const entity = { id: "btn", children: "Ghost", variant: "ghost" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-ghost")).toBe(true)
    })

    it("applies color class for secondary", () => {
      const entity = { id: "btn", children: "Secondary", color: "secondary" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-secondary")).toBe(true)
    })

    it("applies color class for success", () => {
      const entity = { id: "btn", children: "Success", color: "success" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-success")).toBe(true)
    })

    it("applies disabled attribute", () => {
      const entity = { id: "btn", children: "Disabled", disabled: true }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.hasAttribute("disabled")).toBe(true)
    })

    it("applies full width class", () => {
      const entity = { id: "btn", children: "Full Width", fullWidth: true }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-full-width")).toBe(
        true,
      )
    })

    it("sets button type attribute", () => {
      const entity = { id: "btn", children: "Submit", buttonType: "submit" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.type).toBe("submit")
    })

    it("renders with custom template children", () => {
      const entity = {
        id: "btn",
        children: html`<span class="content">Custom</span>`,
      }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.textContent.trim()).toBe("Custom")
      expect(buttonElement.querySelector(".content")).not.toBeNull()
    })

    it("passes arbitrary attributes to native button", () => {
      const entity = {
        id: "btn",
        children: "Custom attrs",
        "data-testid": "primary-cta",
        title: "Primary action",
      }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.getAttribute("data-testid")).toBe("primary-cta")
      expect(buttonElement.getAttribute("title")).toBe("Primary action")
    })
  })

  describe("click handler", () => {
    it("dispatches click event on button click", () => {
      const entity = { id: "btn", children: "Click me" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(button.render(entity, api), container)

      const buttonElement = container.querySelector("button")
      buttonElement.click()

      expect(api.getEvents()).toEqual([{ type: "#btn:click" }])
    })
  })
})
