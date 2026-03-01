import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { materialIcon } from "."

describe("materialIcon", () => {
  it("renders icon name", () => {
    const props = { id: "mi", name: "home" }
    const container = document.createElement("div")

    render(materialIcon.render(props), container)

    expect(container.querySelector(".iw-material-icon").textContent).toBe(
      "home",
    )
  })
})
