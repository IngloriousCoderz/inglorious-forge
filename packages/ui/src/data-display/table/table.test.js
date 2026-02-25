import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { table } from "."

describe("table", () => {
  const type = augmentType(table)

  it("renders rows and headers", () => {
    const entity = {
      id: "table",
      columns: [
        { id: "name", label: "Name" },
        { id: "score", label: "Score" },
      ],
      rows: [
        { id: "a", name: "Ada", score: 10 },
        { id: "b", name: "Lin", score: 20 },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(container.querySelectorAll("tbody tr")).toHaveLength(2)
    expect(container.querySelectorAll("thead th")).toHaveLength(2)
  })
})
