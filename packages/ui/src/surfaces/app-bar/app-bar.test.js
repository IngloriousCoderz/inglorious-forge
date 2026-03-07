import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { appBar } from "."

describe("appBar", () => {
  it("renders title and subtitle", () => {
    const container = document.createElement("div")

    render(appBar.render({ title: "Title", subtitle: "Subtitle" }), container)

    expect(container.querySelector(".iw-app-bar-title").textContent).toBe(
      "Title",
    )
    expect(container.querySelector(".iw-app-bar-subtitle").textContent).toBe(
      "Subtitle",
    )
  })

  it("applies position and dense classes", () => {
    const container = document.createElement("div")

    render(appBar.render({ position: "sticky", dense: true }), container)

    const root = container.querySelector(".iw-app-bar")
    expect(root.classList.contains("iw-app-bar-sticky")).toBe(true)
    expect(root.classList.contains("iw-app-bar-dense")).toBe(true)
  })

  it("applies color and placement classes", () => {
    const container = document.createElement("div")

    render(
      appBar.render({
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

    render(appBar.render({ trailing: "Action" }), container)

    expect(
      container.querySelector(".iw-app-bar-trailing").textContent.trim(),
    ).toBe("Action")
  })
})
