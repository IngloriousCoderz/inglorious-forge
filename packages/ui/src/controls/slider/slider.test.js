import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { slider } from "."

describe("slider", () => {
  const type = augmentType(slider)

  it("renders range input with value", () => {
    const entity = { id: "sl", value: 42, min: 10, max: 90 }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const input = container.querySelector('input[type="range"]')
    expect(input.value).toBe("42")
    expect(input.min).toBe("10")
    expect(input.max).toBe("90")
  })

  it("dispatches change events", () => {
    const entity = { id: "sl", value: 0 }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const input = container.querySelector('input[type="range"]')
    input.value = "64"
    input.dispatchEvent(new Event("input"))

    expect(api.getEvents()).toEqual([{ type: "#sl:change", payload: 64 }])
  })
})
