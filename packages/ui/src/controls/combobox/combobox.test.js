import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Combobox } from "."

describe("combobox", () => {
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
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(container.querySelector(".iw-combobox-value").textContent).toBe("B")
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
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(
      container.querySelectorAll(".iw-combobox-multi-value-tag").length,
    ).toBe(2)
    expect(container.querySelectorAll(".iw-chip").length).toBe(2)
    expect(
      container
        .querySelector(".iw-chip")
        .classList.contains("iw-chip-shape-rounded"),
    ).toBe(true)
  })

  it("removes a multi tag through chip remove action", () => {
    const entity = {
      id: "sel",
      type: "select",
      isMulti: true,
      selectedValue: ["a"],
      options: [{ label: "A", value: "a" }],
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    container.querySelector(".iw-chip-remove").click()

    expect(api.getEvents()).toEqual([
      {
        type: "#sel:optionSelect",
        payload: { label: "A", value: "a" },
      },
    ])
  })

  it("dispatches toggle event from control click", () => {
    const entity = { id: "sel", type: "select", options: [] }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    container.querySelector(".iw-combobox-control").click()

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

    Combobox.create(entity)
    Combobox.optionSelect(entity, { label: "A", value: "a" })
    Combobox.optionSelect(entity, { label: "B", value: "b" })

    expect(entity.selectedValue).toEqual(["a", "b"])

    Combobox.optionSelect(entity, { label: "A", value: "a" })
    expect(entity.selectedValue).toEqual(["b"])
  })
})
