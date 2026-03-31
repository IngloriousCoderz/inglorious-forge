import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Divider } from "."

describe("divider", () => {
  it("renders horizontal divider", () => {
    const props = { id: "dv" }
    const container = document.createElement("div")

    render(Divider.render(props), container)

    expect(container.querySelector(".iw-divider")).not.toBeNull()
  })

  it("renders vertical inset divider", () => {
    const props = { id: "dv", orientation: "vertical", isInset: true }
    const container = document.createElement("div")

    render(Divider.render(props), container)

    const root = container.querySelector(".iw-divider")
    expect(root.classList.contains("iw-divider-vertical")).toBe(true)
    expect(root.classList.contains("iw-divider-inset")).toBe(true)
  })
})
