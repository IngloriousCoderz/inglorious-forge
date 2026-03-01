import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { badge } from "."

describe("badge", () => {
  it("renders content", () => {
    const props = { id: "bg", children: "New", size: "lg" }
    const container = document.createElement("div")

    render(badge.render(props), container)

    const element = container.querySelector(".iw-badge")
    expect(element.textContent.trim()).toBe("New")
    expect(element.classList.contains("iw-badge-lg")).toBe(true)
  })
})
