import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Icon } from "."

describe("icon", () => {
  it("renders content", () => {
    const props = { id: "ic", children: "★" }
    const container = document.createElement("div")

    render(Icon.render(props), container)

    expect(container.querySelector(".iw-icon").textContent).toBe("★")
  })

  it("applies size, color style, and click handler", () => {
    let isClicked = false
    const props = {
      id: "ic",
      children: "★",
      size: "lg",
      color: "red",
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(Icon.render(props), container)

    const element = container.querySelector(".iw-icon")
    expect(element.classList.contains("iw-icon-lg")).toBe(true)
    expect(element.getAttribute("style")).toContain("color: red")
    element.click()
    expect(isClicked).toBe(true)
  })
})
