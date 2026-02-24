import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { switchControl } from "."

describe("switchControl", () => {
  const type = augmentType(switchControl)

  it("renders checked state", () => {
    const entity = { id: "sw", checked: true, label: "Enabled" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(container.querySelector(".iw-switch-input").checked).toBe(true)
    expect(container.querySelector(".iw-switch-label").textContent).toBe(
      "Enabled",
    )
  })

  it("dispatches change event", () => {
    const entity = { id: "sw", checked: false }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const input = container.querySelector(".iw-switch-input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(api.getEvents()).toEqual([{ type: "#sw:change", payload: true }])
  })
})
