import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { MaterialIcon } from "."

describe("materialIcon", () => {
  it("renders icon name", () => {
    const props = { id: "mi", name: "home" }
    const container = document.createElement("div")

    render(MaterialIcon.render(props), container)

    expect(container.querySelector(".iw-material-icon").textContent).toBe(
      "home",
    )
  })

  it("mirrors an icon in right-to-left text", () => {
    const container = document.createElement("div")

    render(MaterialIcon.render({ name: "arrow_back" }), container)
    expect(container.querySelector(".iw-material-icon-rtl")).toBeNull()

    render(
      MaterialIcon.render({ name: "arrow_back", direction: "rtl" }),
      container,
    )
    expect(container.querySelector(".iw-material-icon-rtl")).not.toBeNull()
  })

  it("applies size, filled state, and click handler", () => {
    let isClicked = false
    const props = {
      id: "mi",
      name: "settings",
      size: "lg",
      isFilled: false,
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(MaterialIcon.render(props), container)

    const element = container.querySelector(".iw-material-icon")
    expect(element.classList.contains("iw-material-icon-lg")).toBe(true)
    expect(element.classList.contains("iw-material-icon-filled")).toBe(false)
    element.click()
    expect(isClicked).toBe(true)
  })
})
