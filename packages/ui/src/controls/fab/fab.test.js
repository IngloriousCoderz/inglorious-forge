import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { fab } from "."

describe("fab", () => {
  it("renders content", () => {
    const entity = { id: "fab", children: "+" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(fab.render(entity, api), container)

    expect(container.querySelector(".iw-fab").textContent.trim()).toBe("+")
  })

  it("dispatches click", () => {
    const entity = { id: "fab", children: "+" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(fab.render(entity, api), container)

    container.querySelector("button").click()

    expect(api.getEvents()).toEqual([{ type: "#fab:click" }])
  })
})
