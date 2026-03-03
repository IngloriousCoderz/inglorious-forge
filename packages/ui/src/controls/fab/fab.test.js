import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { fab } from "."

describe("fab", () => {
  it("renders content", () => {
    const props = { children: "+" }
    const container = document.createElement("div")

    render(fab.render(props), container)

    expect(container.querySelector(".iw-fab").textContent.trim()).toBe("+")
  })

  it("dispatches click", () => {
    let isClicked = false
    const props = { children: "+", onClick: () => (isClicked = true) }
    const container = document.createElement("div")

    render(fab.render(props), container)

    container.querySelector("button").click()

    expect(isClicked).toBe(true)
  })

  it("renders extended variant and merges className", () => {
    const props = { children: "Create", extended: true, className: "extra" }
    const container = document.createElement("div")

    render(fab.render(props), container)

    const buttonElement = container.querySelector(".iw-fab")
    expect(buttonElement.classList.contains("iw-fab-extended")).toBe(true)
    expect(buttonElement.classList.contains("extra")).toBe(true)
    expect(container.querySelector(".iw-fab-content")).toBeNull()
  })
})
