import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { materialIcon } from "."

describe("materialIcon", () => {
  const type = augmentType(materialIcon)

  it("renders icon name", () => {
    const entity = { id: "mi", name: "home" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)
    expect(container.querySelector(".iw-material-icon").textContent).toBe(
      "home",
    )
  })
})
