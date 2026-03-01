import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { icon } from "."

describe("icon", () => {
  it("renders content", () => {
    const props = { id: "ic", children: "★" }
    const container = document.createElement("div")

    render(icon.render(props), container)

    expect(container.querySelector(".iw-icon").textContent).toBe("★")
  })
})
