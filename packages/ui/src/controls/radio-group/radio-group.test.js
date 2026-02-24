import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { radioGroup } from "."

describe("radioGroup", () => {
  const type = augmentType(radioGroup)

  it("renders options and selected state", () => {
    const entity = {
      id: "rg",
      value: "b",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const radios = container.querySelectorAll('input[type="radio"]')
    expect(radios.length).toBe(2)
    expect(radios[1].checked).toBe(true)
  })

  it("dispatches change event", () => {
    const entity = {
      id: "rg",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const radio = container.querySelector('input[value="b"]')
    radio.checked = true
    radio.dispatchEvent(new Event("change"))

    expect(api.getEvents()).toEqual([{ type: "#rg:change", payload: "b" }])
  })
})
