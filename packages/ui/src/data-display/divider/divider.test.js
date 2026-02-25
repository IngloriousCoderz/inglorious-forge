import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { divider } from "."

describe("divider", () => {
  it("renders horizontal divider", () => {
    const entity = { id: "dv" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(divider.render(entity, api), container)

    expect(container.querySelector(".iw-divider")).not.toBeNull()
  })
})
