import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Checkbox } from "."

describe("checkbox", () => {
  it("renders label and checkbox", () => {
    const props = {
      id: "cb",
      label: "Accept",
      isChecked: true,
      color: "warning",
    }
    const container = document.createElement("div")

    render(Checkbox.render(props), container)

    expect(container.querySelector(".iw-checkbox-label").textContent).toBe(
      "Accept",
    )
    expect(container.querySelector("input").checked).toBe(true)
    expect(
      container
        .querySelector(".iw-checkbox")
        .classList.contains("iw-checkbox-warning"),
    ).toBe(true)
  })

  it("dispatches change event", () => {
    let isChecked = false
    const props = {
      id: "cb",
      isChecked: false,
      onChange: (value) => (isChecked = value),
    }
    const container = document.createElement("div")

    render(Checkbox.render(props), container)

    const input = container.querySelector("input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(isChecked).toBe(true)
  })

  it("applies size and disabled/required state", () => {
    const props = {
      id: "cb",
      name: "terms",
      size: "lg",
      isDisabled: true,
      isRequired: true,
    }
    const container = document.createElement("div")

    render(Checkbox.render(props), container)

    const root = container.querySelector(".iw-checkbox")
    const input = container.querySelector("input")
    expect(root.classList.contains("iw-checkbox-lg")).toBe(true)
    expect(input.disabled).toBe(true)
    expect(input.required).toBe(true)
    expect(input.name).toBe("terms")
    expect(input.id).toBe("cb")
  })
})

describe("checkbox without an id", () => {
  it("toggles from its label", () => {
    let newValue = null
    const container = document.createElement("div")

    render(
      Checkbox.render({
        label: "Agree",
        onChange: (value) => (newValue = value),
      }),
      container,
    )

    expect(container.querySelector("label").hasAttribute("for")).toBe(false)
    expect(container.querySelector("input").hasAttribute("id")).toBe(false)

    // A label only clicks through to its control once it is in the document.
    document.body.append(container)
    container.querySelector(".iw-checkbox-label").click()
    container.remove()

    expect(newValue).toBe(true)
  })
})

describe("checkbox classes", () => {
  it("does not give the input the root class, so color variants reach it", () => {
    const container = document.createElement("div")

    render(Checkbox.render({ color: "success" }), container)

    const input = container.querySelector("input")
    expect(input.classList.contains("iw-checkbox-input")).toBe(true)
    expect(input.classList.contains("iw-checkbox")).toBe(false)
  })

  it("shows a description under the label", () => {
    const container = document.createElement("div")

    render(
      Checkbox.render({ label: "News", description: "Once a week" }),
      container,
    )

    expect(
      container.querySelector(".iw-checkbox-description").textContent,
    ).toBe("Once a week")
  })

  it("draws as a card with media above the label", () => {
    const container = document.createElement("div")

    render(
      Checkbox.render({
        label: "Breakfast",
        variant: "card",
        media: html`<img alt="" />`,
      }),
      container,
    )

    expect(container.querySelector(".iw-checkbox").classList).toContain(
      "iw-checkbox-card",
    )
    expect(container.querySelector(".iw-checkbox-media img")).not.toBeNull()
    expect(container.querySelector("input[type=checkbox]")).not.toBeNull()
  })
})
