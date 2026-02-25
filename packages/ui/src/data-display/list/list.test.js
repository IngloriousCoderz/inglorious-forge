import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { list } from "."

describe("list", () => {
  it("renders list items", () => {
    const entity = {
      id: "list",
      items: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(list.render(entity, api), container)

    expect(container.querySelectorAll(".iw-list-item")).toHaveLength(2)
  })
})
