import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { grid } from "."

describe("grid", () => {
  it("renders children", () => {
    const entity = {
      id: "gd",
      children: [html`<div>A</div>`, html`<div>B</div>`, html`<div>C</div>`],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(grid.render(entity, api), container)

    expect(
      container.querySelector(".iw-grid").textContent.replace(/\s+/g, ""),
    ).toBe("ABC")
  })

  it("applies grid styles and classes", () => {
    const entity = {
      id: "gd",
      columns: 4,
      gap: "lg",
      align: "center",
      justify: "center",
      fullWidth: true,
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(grid.render(entity, api), container)

    const root = container.querySelector(".iw-grid")
    expect(root.style.gridTemplateColumns).toContain("repeat(4")
    expect(root.classList.contains("iw-grid-gap-lg")).toBe(true)
    expect(root.classList.contains("iw-grid-align-center")).toBe(true)
    expect(root.classList.contains("iw-grid-justify-center")).toBe(true)
    expect(root.classList.contains("iw-grid-full-width")).toBe(true)
  })

  it("uses minColumnWidth for auto-fit layouts", () => {
    const entity = { id: "gd", minColumnWidth: "12rem" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(grid.render(entity, api), container)

    expect(
      container.querySelector(".iw-grid").style.gridTemplateColumns,
    ).toContain("auto-fit")
  })
})
