import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { list } from "."

describe("list", () => {
  it("renders list items", () => {
    const props = {
      id: "list",
      items: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    }
    const container = document.createElement("div")

    render(list.render(props), container)

    expect(container.querySelectorAll(".iw-list-item")).toHaveLength(2)
  })
})
