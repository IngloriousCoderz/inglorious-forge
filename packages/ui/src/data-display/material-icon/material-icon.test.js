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

  it("applies size, filled state, and click handler", () => {
    let isClicked = false
    const props = {
      id: "mi",
      name: "settings",
      size: "lg",
      filled: false,
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(materialIcon.render(props), container)

    const element = container.querySelector(".iw-material-icon")
    expect(element.classList.contains("iw-material-icon-lg")).toBe(true)
    expect(element.classList.contains("iw-material-icon-filled")).toBe(false)
    element.click()
    expect(isClicked).toBe(true)
  })
})
