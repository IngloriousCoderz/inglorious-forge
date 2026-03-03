import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { list } from "."

describe("list", () => {
  it("renders list items", () => {
    const props = {
      id: "list",
      items: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    }
    const container = document.createElement("div")

    render(list.render(props), container)

    expect(container.querySelectorAll(".iw-list-item")).toHaveLength(2)
  })

  it("renders ordered list when isOrdered is true", () => {
    const props = {
      id: "list",
      isOrdered: true,
      items: ["A", "B"],
    }
    const container = document.createElement("div")

    render(list.render(props), container)

    expect(container.querySelector("ol")).not.toBeNull()
  })

  it("applies dense and divided classes", () => {
    const props = {
      id: "list",
      isDense: true,
      isDivided: true,
      items: ["A", "B"],
    }
    const container = document.createElement("div")

    render(list.render(props), container)

    const root = container.querySelector(".iw-list")
    expect(root.classList.contains("iw-list-dense")).toBe(true)
    expect(root.classList.contains("iw-list-divided")).toBe(true)
  })

  it("dispatches item click with payload", () => {
    let clicked = null
    const props = {
      id: "list",
      items: [{ id: "a", label: "A" }],
      onItemClick: (item, index) => (clicked = { item, index }),
    }
    const container = document.createElement("div")

    render(list.render(props), container)

    container.querySelector(".iw-list-item").click()
    expect(clicked).toEqual({ item: { id: "a", label: "A" }, index: 0 })
  })
})
