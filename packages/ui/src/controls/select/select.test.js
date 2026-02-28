import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { select } from "."

describe("select", () => {
  it("renders with selected value", () => {
    const props = {
      value: "b",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(select.render(props), container)

    expect(container.querySelector(".iw-select").value).toBe("b")
  })
})
