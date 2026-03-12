import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { table } from "."

describe("table", () => {
  it("renders rows and headers", () => {
    const props = {
      id: "table",
      columns: [
        { id: "name", label: "Name" },
        { id: "score", label: "Score" },
      ],
      rows: [
        { id: "a", name: "Ada", score: 10 },
        { id: "b", name: "Lin", score: 20 },
      ],
    }
    const container = document.createElement("div")

    render(table.render(props), container)

    expect(container.querySelectorAll("tbody tr")).toHaveLength(2)
    expect(container.querySelectorAll("thead th")).toHaveLength(2)
  })

  it("applies full width and striped classes", () => {
    const props = {
      columns: [{ id: "name" }],
      rows: [{ id: "a", name: "Ada" }],
      isFullWidth: true,
      isStriped: true,
    }
    const container = document.createElement("div")

    render(table.render(props), container)

    const tableElement = container.querySelector(".iw-table")
    expect(tableElement.classList.contains("iw-table-full-width")).toBe(true)
    expect(tableElement.classList.contains("iw-table-striped")).toBe(true)
  })

  it("dispatches row click", () => {
    let clicked = null
    const row = { id: "a", name: "Ada" }
    const props = {
      columns: [{ id: "name" }],
      rows: [row],
      onRowClick: (value) => (clicked = value),
    }
    const container = document.createElement("div")

    render(table.render(props), container)

    container.querySelector("tbody tr").click()
    expect(clicked).toBe(row)
  })

  it("uses title fallback for header cells", () => {
    const props = {
      columns: [{ id: "name", title: "Full Name" }],
      rows: [{ id: "a", name: "Ada" }],
    }
    const container = document.createElement("div")

    render(table.render(props), container)

    expect(container.querySelector("thead th").textContent).toBe("Full Name")
  })
})
