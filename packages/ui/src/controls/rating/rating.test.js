import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { rating } from "."

describe("rating", () => {
  it("renders max items", () => {
    const entity = { id: "rt", value: 2, max: 5 }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(rating.render(entity, api), container)

    expect(container.querySelectorAll(".iw-rating-item").length).toBe(5)
  })

  it("dispatches selected value on click", () => {
    const entity = { id: "rt", value: 0, max: 5 }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(rating.render(entity, api), container)

    container.querySelectorAll(".iw-rating-item")[3].click()

    expect(api.getEvents()).toEqual([{ type: "#rt:change", payload: 4 }])
  })
})
