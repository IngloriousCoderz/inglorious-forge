import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Textarea } from "."

describe("textarea", () => {
  describe("render", () => {
    it("renders label and textarea", () => {
      const props = { name: "bio", label: "Bio" }
      const container = document.createElement("div")

      render(Textarea.render(props), container)

      const labelElement = container.querySelector("label")
      const textareaElement = container.querySelector("textarea")
      expect(labelElement.textContent.trim()).toBe("Bio")
      expect(textareaElement.name).toBe("bio")
    })

    it("applies size, auto-size, resize, and error classes", () => {
      const props = {
        size: "lg",
        error: "Too long",
        isAutoSize: true,
        isResizable: true,
      }
      const container = document.createElement("div")

      render(Textarea.render(props), container)

      const textareaElement = container.querySelector("textarea")
      expect(textareaElement.classList.contains("iw-textarea-lg")).toBe(true)
      expect(textareaElement.classList.contains("iw-textarea-auto-size")).toBe(
        true,
      )
      expect(textareaElement.classList.contains("iw-textarea-resizable")).toBe(
        true,
      )
      expect(textareaElement.classList.contains("iw-textarea-error")).toBe(true)
      expect(
        container.querySelector(".iw-textarea-error-message").textContent,
      ).toBe("Too long")
    })

    it("dispatches input and focus events", () => {
      let latestValue = null
      let focusCount = 0
      const props = {
        value: "",
        onChange: (value) => (latestValue = value),
        onFocus: () => (focusCount += 1),
      }
      const container = document.createElement("div")

      render(Textarea.render(props), container)

      const textareaElement = container.querySelector("textarea")
      textareaElement.value = "hello"
      textareaElement.dispatchEvent(new Event("input"))
      textareaElement.dispatchEvent(new Event("focus"))

      expect(latestValue).toBe("hello")
      expect(focusCount).toBe(1)
    })
  })
})
