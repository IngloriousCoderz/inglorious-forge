import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Button } from "."

describe("button", () => {
  describe("render", () => {
    it("renders a button with children", () => {
      const props = { children: "Click me" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.textContent.trim()).toBe("Click me")
    })

    it("renders with default classes", () => {
      const props = { children: "Test" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button")).toBe(true)
    })

    it("applies size class for sm", () => {
      const props = { children: "Small", size: "sm" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-sm")).toBe(true)
    })

    it("applies size class for lg", () => {
      const props = { children: "Large", size: "lg" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-lg")).toBe(true)
    })

    it("applies shape class for round", () => {
      const props = { children: "+", shape: "round" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-shape-round")).toBe(
        true,
      )
    })

    it("applies variant class for outline", () => {
      const props = { children: "Outline", variant: "outline" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-outline")).toBe(true)
    })

    it("applies variant class for ghost", () => {
      const props = { children: "Ghost", variant: "ghost" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-ghost")).toBe(true)
    })

    it("applies color class for secondary", () => {
      const props = { children: "Secondary", color: "secondary" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-secondary")).toBe(true)
    })

    it("applies color class for success", () => {
      const props = { children: "Success", color: "success" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-success")).toBe(true)
    })

    it("applies disabled attribute", () => {
      const props = { children: "Disabled", isDisabled: true }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.hasAttribute("disabled")).toBe(true)
    })

    it("applies full width class", () => {
      const props = { children: "Full Width", isFullWidth: true }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.classList.contains("iw-button-full-width")).toBe(
        true,
      )
    })

    it("sets button type attribute", () => {
      const props = { children: "Submit", buttonType: "submit" }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.type).toBe("submit")
    })

    it("renders with custom template children", () => {
      const props = {
        children: html`<span class="content">Custom</span>`,
      }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.textContent.trim()).toBe("Custom")
      expect(buttonElement.querySelector(".content")).not.toBeNull()
    })

    it("passes arbitrary attributes to native button", () => {
      const props = {
        children: "Custom attrs",
        "data-testid": "primary-cta",
        title: "Primary action",
      }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.getAttribute("data-testid")).toBe("primary-cta")
      expect(buttonElement.getAttribute("title")).toBe("Primary action")
    })

    it("applies aria attributes and custom className", () => {
      const props = {
        children: "Aria",
        ariaLabel: "Primary action",
        isAriaPressed: true,
        className: "extra-class",
      }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      expect(buttonElement.getAttribute("aria-label")).toBe("Primary action")
      expect(buttonElement.getAttribute("aria-pressed")).toBe("true")
      expect(buttonElement.classList.contains("extra-class")).toBe(true)
    })
  })

  describe("click handler", () => {
    it("dispatches click event on button click", () => {
      let isClicked = false
      const props = { children: "Click me", onClick: () => (isClicked = true) }
      const container = document.createElement("div")

      render(Button.render(props), container)

      const buttonElement = container.querySelector("button")
      buttonElement.click()

      expect(isClicked).toBe(true)
    })
  })
})
