import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Rating } from "."

describe("rating", () => {
  it("renders a native radio per point", () => {
    const props = { id: "rt", value: 2, max: 5 }
    const container = document.createElement("div")

    render(Rating.render(props), container)

    const radios = container.querySelectorAll("input[type=radio]")
    expect(radios.length).toBe(5)
    expect([...radios].every((radio) => radio.name === "rt")).toBe(true)
    expect(radios[1].checked).toBe(true)
    expect(radios[1].getAttribute("aria-label")).toBe("2 of 5")
  })

  it("prefers name over id for the group", () => {
    const container = document.createElement("div")

    render(Rating.render({ id: "rt", name: "score" }), container)

    expect(container.querySelector("input").name).toBe("score")
  })

  it("dispatches the value of the star that is picked", () => {
    let newValue = null
    const props = {
      id: "rt",
      value: 0,
      max: 5,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")
    document.body.append(container)

    render(Rating.render(props), container)

    container.querySelectorAll(".iw-rating-input")[3].click()

    expect(newValue).toBe(4)
    container.remove()
  })

  it("disables the group when disabled or read-only", () => {
    let newValue = null
    const props = {
      id: "rt",
      value: 2,
      max: 5,
      isReadOnly: true,
      onChange: (value) => (newValue = value),
    }
    const container = document.createElement("div")

    render(Rating.render(props), container)

    container.querySelectorAll(".iw-rating-input")[0].click()
    expect(newValue).toBeNull()
    expect(container.querySelector("fieldset").disabled).toBe(true)
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

    render(Rating.render(props), container)

    const items = container.querySelectorAll(".iw-rating-item")
    expect(items[0].textContent.trim()).toBe("+")
    expect(items[1].textContent.trim()).toBe("-")
    expect(container.querySelector(".iw-rating-lg")).not.toBeNull()
  })
})
