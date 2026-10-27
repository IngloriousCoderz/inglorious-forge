import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { RadioGroup } from "."

describe("radioGroup", () => {
  it("renders options and selected state", () => {
    const props = {
      id: "rg",
      value: "b",
      color: "error",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(RadioGroup.render(props), container)

    const radios = container.querySelectorAll('input[type="radio"]')
    expect(radios.length).toBe(2)
    expect(radios[1].checked).toBe(true)
    expect(
      container
        .querySelector(".iw-radio-group")
        .classList.contains("iw-radio-group-error"),
    ).toBe(true)
  })

  it("dispatches change event", () => {
    let newValue = null
    const props = {
      id: "rg",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(RadioGroup.render(props), container)

    const radio = container.querySelector('input[value="b"]')
    radio.checked = true
    radio.dispatchEvent(new Event("change"))

    expect(newValue).toBe("b")
  })

  it("renders group label and disables options", () => {
    const props = {
      id: "rg",
      label: "Status",
      isDisabled: true,
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b", isDisabled: true },
      ],
    }
    const container = document.createElement("div")

    render(RadioGroup.render(props), container)

    expect(container.querySelector(".iw-radio-group-label").textContent).toBe(
      "Status",
    )
    const radios = container.querySelectorAll('input[type="radio"]')
    expect(radios[0].disabled).toBe(true)
    expect(radios[1].disabled).toBe(true)
  })
})

describe("radio group ids", () => {
  const options = [
    { label: "A", value: "a" },
    { label: "B", value: "b" },
  ]

  it("gives each option its own id", () => {
    const container = document.createElement("div")

    render(RadioGroup.render({ id: "choice", options }), container)

    const ids = [...container.querySelectorAll("input")].map(
      (input) => input.id,
    )
    expect(ids).toEqual(["choice-0", "choice-1"])
  })

  it("groups the options by id when no name is given", () => {
    const container = document.createElement("div")

    render(RadioGroup.render({ id: "choice", options }), container)

    const names = [...container.querySelectorAll("input")].map(
      (input) => input.name,
    )
    expect(names).toEqual(["choice", "choice"])
  })

  it("shows an option's description", () => {
    const container = document.createElement("div")

    render(
      RadioGroup.render({
        name: "plan",
        options: [{ label: "Pro", value: "pro", description: "For teams" }],
      }),
      container,
    )

    expect(container.querySelector(".iw-radio-description").textContent).toBe(
      "For teams",
    )
  })

  it("draws options as cards with media above the label", () => {
    const container = document.createElement("div")

    render(
      RadioGroup.render({
        name: "room",
        variant: "card",
        options: [
          { label: "Single", value: "single", media: html`<img alt="" />` },
          { label: "Double", value: "double" },
        ],
      }),
      container,
    )

    expect(container.querySelector(".iw-radio-group").classList).toContain(
      "iw-radio-group-card",
    )
    expect(container.querySelectorAll(".iw-radio-media img")).toHaveLength(1)
    expect(container.querySelectorAll("input[type=radio]")).toHaveLength(2)
  })
})
