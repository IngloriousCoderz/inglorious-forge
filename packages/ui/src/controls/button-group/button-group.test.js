import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { buttonGroup } from "."

describe("buttonGroup", () => {
  const type = augmentType(buttonGroup)

  it("renders grouped buttons", () => {
    const entity = {
      id: "bg",
      buttons: [
        { id: "a", label: "A", value: "a" },
        { id: "b", label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(container.querySelectorAll("button").length).toBe(2)
    expect(container.querySelector(".iw-button-group")).not.toBeNull()
  })

  it("dispatches click payload", () => {
    const entity = {
      id: "bg",
      buttons: [{ id: "a", label: "A", value: "alpha" }],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    container.querySelector("button").click()

    expect(api.getEvents()).toEqual([{ type: "#bg:click", payload: "alpha" }])
  })

  it("dispatches change payload in single selection mode", () => {
    const entity = {
      id: "bg",
      value: "a",
      buttons: [
        { id: "a", label: "A", value: "a" },
        { id: "b", label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    container.querySelectorAll("button")[1].click()

    expect(api.getEvents()).toEqual([
      { type: "#bg:click", payload: "b" },
      { type: "#bg:change", payload: "b" },
    ])
  })

  it("dispatches change payload array in multiple selection mode", () => {
    const entity = {
      id: "bg",
      multiple: true,
      value: ["a"],
      buttons: [
        { id: "a", label: "A", value: "a" },
        { id: "b", label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    container.querySelectorAll("button")[1].click()

    expect(api.getEvents()).toEqual([
      { type: "#bg:click", payload: "b" },
      { type: "#bg:change", payload: ["a", "b"] },
    ])
  })
})
