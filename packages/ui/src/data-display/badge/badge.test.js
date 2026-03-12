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

  it("applies color/variant classes and click handler", () => {
    let isClicked = false
    const props = {
      id: "bg",
      children: "Alert",
      color: "warning",
      variant: "outline",
      className: "test-class",
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(badge.render(props), container)

    const element = container.querySelector(".iw-badge")
    expect(element.classList.contains("iw-badge-warning")).toBe(true)
    expect(element.classList.contains("iw-badge-outline")).toBe(true)
    expect(element.classList.contains("test-class")).toBe(true)
    element.click()
    expect(isClicked).toBe(true)
  })

  it("renders a dot badge with ring", () => {
    const props = {
      id: "bg",
      children: "",
      shape: "circle",
      ringWidth: "2px",
    }
    const container = document.createElement("div")

    render(badge.render(props), container)

    const element = container.querySelector(".iw-badge")
    expect(element.classList.contains("iw-badge-shape-circle")).toBe(true)
    expect(element.getAttribute("style")).toContain(
      "--iw-badge-ring-width:2px;",
    )
  })
})
