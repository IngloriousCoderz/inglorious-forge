import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Grid } from "."

describe("grid", () => {
  it("renders children", () => {
    const props = {
      id: "gd",
      children: [html`<div>A</div>`, html`<div>B</div>`, html`<div>C</div>`],
    }
    const container = document.createElement("div")

    render(Grid.render(props), container)

    expect(
      container.querySelector(".iw-grid").textContent.replace(/\s+/g, ""),
    ).toBe("ABC")
  })

  it("applies grid styles and classes", () => {
    const props = {
      id: "gd",
      element: "section",
      columns: 4,
      gap: "lg",
      padding: "md",
      align: "center",
      justify: "center",
      isFullWidth: true,
    }
    const container = document.createElement("div")

    render(Grid.render(props), container)

    const root = container.querySelector(".iw-grid")
    expect(root.tagName).toBe("SECTION")
    expect(root.style.gridTemplateColumns).toContain("repeat(4")
    expect(root.classList.contains("iw-grid-gap-lg")).toBe(true)
    expect(root.classList.contains("iw-grid-padding-md")).toBe(true)
    expect(root.classList.contains("iw-grid-align-center")).toBe(true)
    expect(root.classList.contains("iw-grid-justify-center")).toBe(true)
    expect(root.classList.contains("iw-grid-full-width")).toBe(true)
  })

  it("uses minColumnWidth for auto-fit layouts", () => {
    const props = { id: "gd", minColumnWidth: "12rem" }
    const container = document.createElement("div")

    render(Grid.render(props), container)

    expect(
      container.querySelector(".iw-grid").style.gridTemplateColumns,
    ).toContain("auto-fit")
  })

  it("dispatches click handler", () => {
    let isClicked = false
    const props = { id: "gd", onClick: () => (isClicked = true) }
    const container = document.createElement("div")

    render(Grid.render(props), container)

    container.querySelector(".iw-grid").click()
    expect(isClicked).toBe(true)
  })
})
