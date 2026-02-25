import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { checkbox } from "."

describe("checkbox", () => {
  const type = augmentType(checkbox)

  it("renders label and checkbox", () => {
    const entity = {
      id: "cb",
      label: "Accept",
      checked: true,
      color: "warning",
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(container.querySelector(".iw-checkbox-label").textContent).toBe(
      "Accept",
    )
    expect(container.querySelector("input").checked).toBe(true)
    expect(
      container
        .querySelector(".iw-checkbox-field")
        .classList.contains("iw-checkbox-warning"),
    ).toBe(true)
  })

  it("dispatches change event", () => {
    const entity = { id: "cb", checked: false }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const input = container.querySelector("input")
    input.checked = true
    input.dispatchEvent(new Event("change"))

    expect(api.getEvents()).toEqual([{ type: "#cb:change", payload: true }])
  })
})
