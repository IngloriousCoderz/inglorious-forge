import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { materialIcon } from "."

describe("materialIcon", () => {
  it("renders icon name", () => {
    const entity = { id: "mi", name: "home" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(materialIcon.render(entity, api), container)
    expect(container.querySelector(".iw-material-icon").textContent).toBe(
      "home",
    )
  })
})
