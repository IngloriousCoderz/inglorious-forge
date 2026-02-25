import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { icon } from "."

describe("icon", () => {
  it("renders content", () => {
    const entity = { id: "ic", children: "★" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(icon.render(entity, api), container)

    expect(container.querySelector(".iw-icon").textContent).toBe("★")
  })
})
