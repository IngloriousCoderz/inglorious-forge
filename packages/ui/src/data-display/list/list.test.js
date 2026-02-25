import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { list } from "."

describe("list", () => {
  const type = augmentType(list)

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

    render(type.render(entity, api), container)

    expect(container.querySelectorAll(".iw-list-item")).toHaveLength(2)
  })
})
