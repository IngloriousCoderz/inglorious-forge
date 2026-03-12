import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { accordion } from "."

describe("accordion", () => {
  it("renders items", () => {
    const container = document.createElement("div")

    render(
      accordion.render({
        items: [
          { title: "A", content: "A content" },
          { title: "B", content: "B content" },
        ],
      }),
      container,
    )

    expect(container.querySelectorAll(".iw-accordion-item")).toHaveLength(2)
  })

  it("renders expanded panel", () => {
    const container = document.createElement("div")

    render(
      accordion.render({
        items: [{ title: "A", content: "A content", isExpanded: true }],
      }),
      container,
    )

    expect(
      container.querySelector(".iw-accordion-panel").textContent.trim(),
    ).toBe("A content")
  })

  it("dispatches onItemToggle", () => {
    let payload = null
    const items = [{ title: "A", content: "A content", isExpanded: false }]
    const container = document.createElement("div")

    render(
      accordion.render({
        items,
        onItemToggle: (item, index, expanded) => {
          payload = { item, index, expanded }
        },
      }),
      container,
    )

    container.querySelector(".iw-accordion-trigger").click()

    expect(payload).toEqual({ item: items[0], index: 0, expanded: true })
  })
})
