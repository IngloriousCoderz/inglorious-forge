import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { AppBar } from "."

describe("appBar", () => {
  it("renders title and subtitle", () => {
    const container = document.createElement("div")

    render(AppBar.render({ title: "Title", subtitle: "Subtitle" }), container)

    expect(container.querySelector(".iw-app-bar-title").textContent).toBe(
      "Title",
    )
    expect(container.querySelector(".iw-app-bar-subtitle").textContent).toBe(
      "Subtitle",
    )
  })

  it("applies position and dense classes", () => {
    const container = document.createElement("div")

    render(AppBar.render({ position: "sticky", isDense: true }), container)

    const root = container.querySelector(".iw-app-bar")
    expect(root.classList.contains("iw-app-bar-sticky")).toBe(true)
    expect(root.classList.contains("iw-app-bar-dense")).toBe(true)
  })

  it("applies color and placement classes", () => {
    const container = document.createElement("div")

    render(
      AppBar.render({
        color: "primary",
        placement: "bottom",
        position: "fixed",
      }),
      container,
    )

    const root = container.querySelector(".iw-app-bar")
    expect(root.classList.contains("iw-app-bar-color-primary")).toBe(true)
    expect(root.classList.contains("iw-app-bar-placement-bottom")).toBe(true)
    expect(root.classList.contains("iw-app-bar-fixed")).toBe(true)
  })

  it("renders trailing region", () => {
    const container = document.createElement("div")

    render(AppBar.render({ trailing: "Action" }), container)

    expect(
      container.querySelector(".iw-app-bar-trailing").textContent.trim(),
    ).toBe("Action")
  })
})
