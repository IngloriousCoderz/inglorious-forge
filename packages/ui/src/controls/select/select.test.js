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
    // The wrapper always renders so the layout does not shift when one appears.
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

    // Showing both tells someone how to fix a field they already got wrong.
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
    // Asserted from the stylesheet itself rather than a computed style: jsdom
    // resolves no custom properties, so this is the only check that would have
    // caught the hint quietly rendering in the error colour.
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
    // A native select can only contain options, so the arrow is a sibling of
    // the element, inside the frame that is the box — the shape Input has.
    expect(arrow.textContent).toBe("▼")
    expect(arrow.getAttribute("aria-hidden")).toBe("true")
    expect(arrow.closest(".iw-select-frame")).toBeTruthy()
    expect(container.querySelector(".iw-select-frame select")).toBeTruthy()
  })

  it("sits in the box, beside the element", () => {
    const container = document.createElement("div")

    // A native select can only contain options, so the arrow is a sibling of
    // the element. It must land inside the frame (the box) rather than the
    // root, or a label above would drag it out of position.
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
    // Comments name the things they replaced, so assertions run on rules only.
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "")

    // The arrow was two linear-gradients on background-image, and the hover
    // rule used the `background` shorthand, which resets background-image to
    // none — so the arrow vanished the moment the field was hovered.
    expect(css).not.toMatch(/linear-gradient/)
    // Matched anywhere in the file, not per rule. The stylesheet is nested, so
    // a per-block regex cannot see past the first nested block — which is
    // exactly where a shorthand can hide. `background-color:` does not match
    // `\bbackground:`, because the colon has to follow immediately.
    expect(css).not.toMatch(/\bbackground:/)
    expect(css).toMatch(/background-color:/)
    expect(css).toMatch(/\.iw-select-arrow/)
    // The glyph is a text character: unpinned it inherits whatever font-size
    // the surrounding context happens to carry.
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
