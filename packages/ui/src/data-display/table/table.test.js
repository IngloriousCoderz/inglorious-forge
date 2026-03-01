import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { table } from "."

describe("table", () => {
  it("renders rows and headers", () => {
    const props = {
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
    const container = document.createElement("div")

    render(table.render(props), container)

    expect(container.querySelectorAll("tbody tr")).toHaveLength(2)
    expect(container.querySelectorAll("thead th")).toHaveLength(2)
  })
})
