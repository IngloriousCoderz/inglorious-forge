import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { backdrop } from "."

describe("backdrop", () => {
  it("renders when open", () => {
    const props = { isOpen: true, children: "Hello" }
    const container = document.createElement("div")

    render(backdrop.render(props), container)

    expect(container.querySelector(".iw-backdrop")).not.toBeNull()
    expect(container.querySelector(".iw-backdrop-content").textContent).toBe(
      "Hello",
    )
  })

  it("does not render when closed", () => {
    const props = { isOpen: false }
    const container = document.createElement("div")

    render(backdrop.render(props), container)

    expect(container.querySelector(".iw-backdrop")).toBeNull()
  })
})
