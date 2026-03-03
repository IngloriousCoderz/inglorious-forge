import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { rating } from "."

describe("rating", () => {
  it("renders max items", () => {
    const props = { id: "rt", value: 2, max: 5 }
    const container = document.createElement("div")

    render(rating.render(props), container)

    expect(container.querySelectorAll(".iw-rating-item").length).toBe(5)
  })

  it("dispatches selected value on click", () => {
    let newValue = null
    const props = {
      id: "rt",
      value: 0,
      max: 5,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(rating.render(props), container)

    container.querySelectorAll(".iw-rating-item")[3].click()

    expect(newValue).toBe(4)
  })

  it("respects disabled and readonly states", () => {
    let newValue = null
    const props = {
      id: "rt",
      value: 2,
      max: 5,
      disabled: true,
      readonly: true,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(rating.render(props), container)

    container.querySelectorAll(".iw-rating-item")[0].click()
    expect(newValue).toBeNull()
    expect(container.querySelector(".iw-rating-disabled")).not.toBeNull()
    expect(container.querySelector(".iw-rating-readonly")).not.toBeNull()
  })

  it("supports custom symbols and size", () => {
    const props = {
      id: "rt",
      value: 1,
      max: 2,
      symbol: "+",
      emptySymbol: "-",
      size: "lg",
    }
    const container = document.createElement("div")

    render(rating.render(props), container)

    const items = container.querySelectorAll(".iw-rating-item")
    expect(items[0].textContent.trim()).toBe("+")
    expect(items[1].textContent.trim()).toBe("-")
    expect(container.querySelector(".iw-rating-lg")).not.toBeNull()
  })
})
