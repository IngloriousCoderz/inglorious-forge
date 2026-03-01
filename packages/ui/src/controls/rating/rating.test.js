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
})
