import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { divider } from "."

describe("divider", () => {
  it("renders horizontal divider", () => {
    const props = { id: "dv" }
    const container = document.createElement("div")

    render(divider.render(props), container)

    expect(container.querySelector(".iw-divider")).not.toBeNull()
  })
})
