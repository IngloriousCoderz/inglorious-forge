import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Select } from "."

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

    render(Select.render(props), container)

    expect(container.querySelector(".iw-select-control").value).toBe("b")
  })

  it("supports multiple selection and disabled state", () => {
    const props = {
      isMulti: true,
      isDisabled: true,
      options: ["a", "b"],
    }
    const container = document.createElement("div")

    render(Select.render(props), container)

    const selectElement = container.querySelector("select")
    expect(selectElement.multiple).toBe(true)
    expect(selectElement.disabled).toBe(true)
  })

  it("applies size and fullWidth classes", () => {
    const props = { size: "lg", isFullWidth: true, options: ["a", "b"] }
    const container = document.createElement("div")

    render(Select.render(props), container)

    const selectElement = container.querySelector(".iw-select-control")
    expect(selectElement.classList.contains("iw-select-lg")).toBe(true)
    expect(
      container
        .querySelector(".iw-select")
        .classList.contains("iw-select-full-width"),
    ).toBe(true)
  })

  it("respects disabled options", () => {
    const props = {
      options: [
        { label: "A", value: "a", isDisabled: true },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(Select.render(props), container)

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

      render(Select.render(props), container)

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

      render(Select.render(props), container)

      const selectElement = container.querySelector("select")
      selectElement.dispatchEvent(new Event("focus"))
      selectElement.dispatchEvent(new Event("blur"))

      expect(focusCount).toBe(1)
      expect(blurCount).toBe(1)
    })
  })
  it("renders a label bound to the select", () => {
    const container = document.createElement("div")

    render(Select.render({ id: "s", label: "Style", options: [] }), container)

    const label = container.querySelector(".iw-select-label")
    expect(label.textContent.trim()).toBe("Style")
    expect(label.getAttribute("for")).toBe("s")
    expect(container.querySelector("#s")).toBeTruthy()
  })

  it("names the select with ariaLabel when it has no visible label", () => {
    const container = document.createElement("div")

    render(Select.render({ ariaLabel: "Language", options: [] }), container)
    expect(container.querySelector("select").getAttribute("aria-label")).toBe(
      "Language",
    )

    render(Select.render({ options: [] }), container)
    expect(container.querySelector("select").hasAttribute("aria-label")).toBe(
      false,
    )
  })

  it("marks a required select and sets the attribute", () => {
    const container = document.createElement("div")

    render(
      Select.render({ id: "s", label: "Style", isRequired: true, options: [] }),
      container,
    )

    expect(
      container.querySelector(".iw-select-label .iw-select-required"),
    ).toBeTruthy()
    expect(container.querySelector("select").hasAttribute("required")).toBe(
      true,
    )
  })

  it("shows an error and marks the select", () => {
    const container = document.createElement("div")

    render(
      Select.render({ id: "s", error: "Pick a style", options: [] }),
      container,
    )

    expect(
      container.querySelector(".iw-select-error-message").textContent,
    ).toBe("Pick a style")
    expect(
      container
        .querySelector(".iw-select-control")
        .classList.contains("iw-select-control-error"),
    ).toBe(true)
  })

  it("leaves label and error out when not given", () => {
    const container = document.close?.() ?? document.createElement("div")

    render(Select.render({ id: "s", options: [] }), container)

    expect(container.querySelector(".iw-select-label")).toBeNull()
    expect(container.querySelector(".iw-select-error-message")).toBeNull()
    expect(container.querySelector(".iw-select")).toBeTruthy()
  })
  it("shows a hint under the select", () => {
    const container = document.createElement("div")

    render(
      Select.render({ id: "s", hint: "Pick a region", options: [] }),
      container,
    )

    const hint = container.querySelector(".iw-select-hint")
    expect(hint.textContent).toBe("Pick a region")
  })

  it("prefers the error over the hint", () => {
    const container = document.createElement("div")

    render(
      Select.render({
        id: "s",
        hint: "Pick a region",
        error: "Required",
        options: [],
      }),
      container,
    )

    expect(container.querySelector(".iw-select-hint")).toBeNull()
    expect(
      container.querySelector(".iw-select-error-message").textContent,
    ).toBe("Required")
  })

  it("leaves required off by default", () => {
    const container = document.createElement("div")

    render(Select.render({ id: "s", options: [] }), container)

    expect(container.querySelector("select").hasAttribute("required")).toBe(
      false,
    )
  })
  it("styles the hint as muted and the error as danger", async () => {
    const css = await import("./style.css?raw")

    expect(css.default).toMatch(
      /\.iw-select-hint\s*\{[^}]*--iw-color-text-muted/,
    )
    expect(css.default).toMatch(
      /\.iw-select-error-message\s*\{[^}]*--iw-color-error/,
    )
  })
})

describe("select arrow", () => {
  it("renders a decorative arrow alongside the select", () => {
    const container = document.createElement("div")

    render(Select.render({ id: "s", options: [] }), container)

    const arrow = container.querySelector(".iw-select-arrow")
    expect(arrow.textContent).toBe("▼")
    expect(arrow.getAttribute("aria-hidden")).toBe("true")
    expect(arrow.closest(".iw-select-frame")).toBeTruthy()
    expect(container.querySelector(".iw-select-frame select")).toBeTruthy()
  })

  it("sits in the box, beside the element", () => {
    const container = document.createElement("div")

    render(
      Select.render({
        id: "s",
        label: "Style",
        error: "Pick one",
        options: [],
      }),
      container,
    )

    const frame = container.querySelector(".iw-select-frame")
    const arrow = container.querySelector(".iw-select-arrow")
    expect(frame.contains(arrow)).toBe(true)
    expect(frame.querySelector("select")).toBeTruthy()
    expect(container.querySelector(".iw-select > .iw-select-arrow")).toBeNull()
  })

  it("drops the gradient arrow and the background shorthand that killed it", async () => {
    const { default: raw } = await import("./style.css?raw")
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "")

    expect(css).not.toMatch(/linear-gradient/)
    expect(css).not.toMatch(/\bbackground:/)
    expect(css).toMatch(/background-color:/)
    expect(css).toMatch(/\.iw-select-arrow/)
    const arrowBlock = css.match(/\.iw-select-arrow \{([^}]*)\}/)
    expect(arrowBlock).toBeTruthy()
    expect(arrowBlock[1]).toMatch(/font-size:/)
    expect(css).toMatch(
      /\.iw-select-frame:has\(\.iw-select-control:disabled\) \.iw-select-arrow/,
    )
  })
})

describe("select accessibility", () => {
  it("names itself after its label when there is no id to tie them", () => {
    const container = document.createElement("div")

    render(Select.render({ label: "Policy", options: ["a"] }), container)

    const select = container.querySelector("select")
    expect(select.hasAttribute("id")).toBe(false)
    expect(container.querySelector("label").hasAttribute("for")).toBe(false)
    expect(select.getAttribute("aria-label")).toBe("Policy")
  })

  it("points at its message and reports it is invalid", () => {
    const container = document.createElement("div")

    render(
      Select.render({ id: "policy", options: ["a"], error: "Required" }),
      container,
    )

    const select = container.querySelector("select")
    expect(select.getAttribute("aria-describedby")).toBe("policy-message")
    expect(select.getAttribute("aria-invalid")).toBe("true")
  })
})
