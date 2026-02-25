import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { chip } from "."

describe("chip", () => {
  const type = augmentType(chip)

  it("renders and emits remove", () => {
    const entity = {
      id: "chip",
      children: "Tag",
      removable: true,
      color: "warning",
      size: "lg",
      shape: "square",
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)
    container.querySelector(".iw-chip-remove").click()

    const element = container.querySelector(".iw-chip")
    expect(element.classList.contains("iw-chip-lg")).toBe(true)
    expect(element.classList.contains("iw-chip-warning")).toBe(true)
    expect(element.classList.contains("iw-chip-shape-square")).toBe(true)
    expect(api.getEvents()).toEqual([{ type: "#chip:remove" }])
  })
})
