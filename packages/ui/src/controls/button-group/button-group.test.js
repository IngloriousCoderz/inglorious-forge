import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { buttonGroup } from "."

describe("buttonGroup", () => {
  it("renders grouped buttons", () => {
    const props = {
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    expect(container.querySelectorAll("button").length).toBe(2)
    expect(container.querySelector(".iw-button-group")).not.toBeNull()
  })

  it("dispatches click payload", () => {
    let selectedValues = null
    const props = {
      buttons: [{ label: "A", value: "alpha" }],
      onChange: (values) => (selectedValues = values),
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    container.querySelector("button").click()

    expect(selectedValues).toBe("alpha")
  })

  it("dispatches change payload in single selection mode", () => {
    let selectedValues = null
    const props = {
      value: "a",
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      onChange: (values) => (selectedValues = values),
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    container.querySelectorAll("button")[1].click()

    expect(selectedValues).toBe("b")
  })

  it("dispatches change payload array in multiple selection mode", () => {
    let selectedValues = null
    const props = {
      isMultiple: true,
      value: ["a"],
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      onChange: (values) => (selectedValues = values),
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    container.querySelectorAll("button")[1].click()

    expect(selectedValues).toEqual(["a", "b"])
  })

  it("applies layout classes and attached toggle", () => {
    const props = {
      direction: "column",
      isAttached: false,
      buttons: [{ label: "A", value: "a" }],
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    const root = container.querySelector(".iw-button-group")
    expect(root.classList.contains("iw-button-group-column")).toBe(true)
    expect(root.classList.contains("iw-button-group-attached")).toBe(false)
  })

  it("disables all buttons when disabled", () => {
    const props = {
      isDisabled: true,
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    const buttons = container.querySelectorAll("button")
    expect(buttons[0].disabled).toBe(true)
    expect(buttons[1].disabled).toBe(true)
  })

  it("applies pressed class for selected value", () => {
    const props = {
      value: "a",
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    const pressed = container.querySelector(".iw-button-pressed")
    expect(pressed).not.toBeNull()
  })
})
