import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { select } from "."

describe("select", () => {
  const type = augmentType(select)

  it("renders control with selected value", () => {
    const entity = {
      id: "sel",
      type: "select",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      selectedValue: "b",
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    api.getType = () => type
    render(type.render(entity, api), container)

    expect(container.querySelector(".iw-select-value").textContent).toBe("B")
  })

  it("renders multi tags", () => {
    const entity = {
      id: "sel",
      type: "select",
      isMulti: true,
      selectedValue: ["a", "b"],
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    api.getType = () => type
    render(type.render(entity, api), container)

    expect(
      container.querySelectorAll(".iw-select-multi-value-tag").length,
    ).toBe(2)
  })

  it("dispatches toggle event from control click", () => {
    const entity = { id: "sel", type: "select", options: [] }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    api.getType = () => type
    render(type.render(entity, api), container)

    container.querySelector(".iw-select-control").click()

    expect(api.getEvents()).toEqual([{ type: "#sel:toggle" }])
  })

  it("select handlers support multi selection", () => {
    const entity = {
      id: "sel",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      isMulti: true,
    }

    type.create(entity)
    type.optionSelect(entity, { label: "A", value: "a" })
    type.optionSelect(entity, { label: "B", value: "b" })

    expect(entity.selectedValue).toEqual(["a", "b"])

    type.optionSelect(entity, { label: "A", value: "a" })
    expect(entity.selectedValue).toEqual(["b"])
  })
})
