import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Input } from "."

describe("input", () => {
  describe("render", () => {
    it("renders label and input", () => {
      const props = { name: "email", label: "Email" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      const labelElement = container.querySelector("label")
      const inputElement = container.querySelector("input")
      expect(labelElement.textContent.trim()).toBe("Email")
      expect(inputElement.name).toBe("email")
    })

    it("applies size class", () => {
      const props = { size: "sm" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.classList.contains("iw-input-sm")).toBe(true)
    })

    it("applies error class and renders message", () => {
      const props = { error: "Required" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      const inputElement = container.querySelector("input")
      const errorElement = container.querySelector(".iw-input-error-message")
      expect(inputElement.classList.contains("iw-input-control-error")).toBe(
        true,
      )
      expect(errorElement.textContent).toBe("Required")
    })

    it("renders hint when no error is provided", () => {
      const props = { hint: "Helpful text" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      const hintElement = container.querySelector(".iw-input-hint")
      expect(hintElement.textContent).toBe("Helpful text")
    })

    it("prioritizes error over hint", () => {
      const props = { error: "Required", hint: "Helpful text" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      expect(container.querySelector(".iw-input-error-message")).not.toBeNull()
      expect(container.querySelector(".iw-input-hint")).toBeNull()
    })

    it("renders icons", () => {
      const props = { icon: "@", iconAfter: "✓" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      // No wrapper class: the Icon component is a plain flex child of the
      // frame, which is what replaced the absolutely positioned icon span.
      const frame = container.querySelector(".iw-input-frame")
      expect(frame).toBeTruthy()
      expect(frame.querySelector("input")).toBeTruthy()
      expect(frame.children.length).toBe(3)
      expect(frame.children[1].tagName).toBe("INPUT")
    })

    it("applies number class for numeric fields", () => {
      const props = { inputType: "number", value: "42" }
      const container = document.createElement("div")

      render(Input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.classList.contains("iw-input-number")).toBe(true)
    })

    it("supports native date and color input types", () => {
      const dateContainer = document.createElement("div")
      const colorContainer = document.createElement("div")

      render(
        Input.render({ inputType: "date", value: "2026-08-10" }),
        dateContainer,
      )
      render(
        Input.render({ inputType: "color", value: "#7c3aed" }),
        colorContainer,
      )

      const dateElement = dateContainer.querySelector("input")
      const colorElement = colorContainer.querySelector("input")

      expect(dateElement.type).toBe("date")
      expect(dateElement.value).toBe("2026-08-10")
      expect(colorElement.type).toBe("color")
      expect(colorElement.value).toBe("#7c3aed")
    })

    it("renders required indicator and attributes", () => {
      const props = { id: "email", label: "Email", isRequired: true }
      const container = document.createElement("div")

      render(Input.render(props), container)

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

      render(Input.render(props), container)

      const inputElement = container.querySelector("input")
      expect(inputElement.hasAttribute("disabled")).toBe(true)
      expect(inputElement.hasAttribute("readonly")).toBe(true)
      expect(
        container
          .querySelector(".iw-input")
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

      render(Input.render(props), container)

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

      render(Input.render(props), container)

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

      render(Input.render(props), container)

      const inputElement = container.querySelector("input")
      inputElement.dispatchEvent(new Event("focus"))
      inputElement.dispatchEvent(new Event("blur"))

      expect(focusCount).toBe(1)
      expect(blurCount).toBe(1)
    })
  })
})

describe("input frame and control split", () => {
  it("styles the element itself, not the root wrapper", async () => {
    const { default: raw } = await import("./style.css?raw")
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "")

    // `.iw-input` is the root wrapper. Styling the element under that name
    // matches the wrapper instead, so the <input> silently loses every style.
    // The root appears once, unindented. The element's rule is indented inside
    // the frame and must use its own name: styled under the root's name it
    // matches the wrapper instead, and the <input> loses every style.
    expect(css.match(/^\.iw-input \{/gm)).toHaveLength(1)
    expect(css).toMatch(/^ {4}\.iw-input-control \{/m)
    expect(css).not.toMatch(/^ {4}\.iw-input \{/m)
  })

  it("guards its disabled state on the element", async () => {
    const { default: raw } = await import("./style.css?raw")
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "")

    // The root is never :disabled, so a guard written against it never matches:
    // disabled fields kept their hover and focus backgrounds and never dimmed.
    expect(css).not.toMatch(/:has\(\.iw-input:disabled\)/)
    expect(css).toMatch(/:has\(\.iw-input-control:disabled\)/)
  })

  it("always carries its size class, default included", () => {
    // The stylesheet spells out .iw-input-md as well as sm and lg, so the class
    // is applied at every size — otherwise a default input picks up no height
    // or font-size from the control rules.
    for (const size of ["sm", "md", "lg"]) {
      const container = document.createElement("div")
      render(Input.render({ id: `s-${size}`, size }), container)
      expect(
        container.querySelector("input").classList.contains(`iw-input-${size}`),
      ).toBe(true)
    }
  })

  it("spaces its icons with a gap on the row, not padding on the input", async () => {
    const { default: raw } = await import("./style.css?raw")
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "")

    // The icons are flex children now, so a gap on the row is what separates
    // them from the text. Padding on the input was a workaround for when they
    // were absolutely positioned over it, and only doubled the inset.
    // Checked against the file rather than an extracted block: the nesting
    // makes block extraction brittle, and an earlier version of this assertion
    // silently matched the wrong rule.
    // Anchored on the two-space indent of the nested rule, so it cannot match
    // the `.iw-input-full-width .iw-input-frame` descendant selector above it.
    const frame = css.indexOf("\n  .iw-input-frame {")
    expect(frame).toBeGreaterThan(-1)
    const body = css.slice(frame, css.indexOf("\n  }", frame))
    expect(body).toMatch(/gap: var\(--iw-space-2\)/)
    expect(css).not.toMatch(/has-icon \.iw-input/)
    expect(css).not.toMatch(/has-icon-after \.iw-input/)
  })

  it("fills the frame, which is the box", () => {
    const container = document.createElement("div")

    render(Input.render({ id: "c", icon: "@" }), container)

    // The frame draws the border now, so the input has to stretch to it —
    // otherwise it keeps its intrinsic ~20-character width inside it.
    const input = container.querySelector(".iw-input-control")
    expect(input.closest(".iw-input-frame")).toBeTruthy()
  })
})

describe("input accessibility", () => {
  it("names itself after its label when there is no id to tie them", () => {
    const container = document.createElement("div")

    render(Input.render({ label: "Email" }), container)

    const input = container.querySelector("input")
    expect(input.hasAttribute("id")).toBe(false)
    expect(container.querySelector("label").hasAttribute("for")).toBe(false)
    expect(input.getAttribute("aria-label")).toBe("Email")
  })

  it("is tied to its label and message by id when it has one", () => {
    const container = document.createElement("div")

    render(
      Input.render({ id: "email", label: "Email", hint: "Work address" }),
      container,
    )

    const input = container.querySelector("input")
    expect(container.querySelector("label").getAttribute("for")).toBe("email")
    expect(input.hasAttribute("aria-label")).toBe(false)
    expect(input.getAttribute("aria-describedby")).toBe("email-message")
    expect(container.querySelector("#email-message").textContent).toBe(
      "Work address",
    )
    expect(input.getAttribute("aria-invalid")).toBe("false")
  })

  it("does not leak field props onto the input element", () => {
    const container = document.createElement("div")

    render(
      Input.render({ label: "Email", hint: "Work", isFullWidth: true }),
      container,
    )

    const input = container.querySelector("input")
    expect(input.hasAttribute("label")).toBe(false)
    expect(input.hasAttribute("hint")).toBe(false)
    expect(input.hasAttribute("isfullwidth")).toBe(false)
  })

  it("names a field without a visible label for assistive tech", () => {
    const container = document.createElement("div")

    render(Input.render({ name: "price", ariaLabel: "Price" }), container)

    expect(container.querySelector("input").getAttribute("aria-label")).toBe(
      "Price",
    )
  })
})
