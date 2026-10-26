import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Accordion } from "."

describe("accordion", () => {
  it("renders items", () => {
    const container = document.createElement("div")

    render(
      Accordion.render({
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
      Accordion.render({
        items: [{ title: "A", content: "A content", isExpanded: true }],
      }),
      container,
    )

    expect(
      container.querySelector(".iw-accordion-panel").textContent.trim(),
    ).toBe("A content")
  })

  it("renders each item as an open or closed details", () => {
    const container = document.createElement("div")

    render(
      Accordion.render({
        items: [
          { title: "A", content: "A content", isExpanded: true },
          { title: "B", content: "B content" },
        ],
      }),
      container,
    )

    const [first, second] = container.querySelectorAll("details")
    expect(first.open).toBe(true)
    expect(second.open).toBe(false)
    expect(first.querySelector("summary").textContent).toContain("A")
  })

  it("reports a toggle the browser makes", () => {
    let payload = null
    const items = [{ title: "A", content: "A content", isExpanded: false }]
    const container = document.createElement("div")

    render(
      Accordion.render({
        items,
        onItemToggle: (item, index, expanded) => {
          payload = { item, index, expanded }
        },
      }),
      container,
    )

    container
      .querySelector("details")
      .dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }))

    expect(payload).toEqual({ item: items[0], index: 0, expanded: true })
  })

  it("does not report a toggle that isExpanded made", () => {
    let calls = 0
    const container = document.createElement("div")

    render(
      Accordion.render({
        items: [{ title: "A", isExpanded: true }],
        onItemToggle: () => calls++,
      }),
      container,
    )

    container
      .querySelector("details")
      .dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }))

    expect(calls).toBe(0)
  })

  it("refuses to toggle a disabled item", () => {
    const container = document.createElement("div")

    render(
      Accordion.render({ items: [{ title: "A", isDisabled: true }] }),
      container,
    )

    const summary = container.querySelector("summary")
    const click = new MouseEvent("click", { bubbles: true, cancelable: true })
    summary.dispatchEvent(click)

    expect(click.defaultPrevented).toBe(true)
    expect(summary.getAttribute("aria-disabled")).toBe("true")
  })

  it("groups items under a name so only one opens", () => {
    const container = document.createElement("div")

    render(
      Accordion.render({
        name: "faq",
        items: [{ title: "A" }, { title: "B" }],
      }),
      container,
    )

    const names = [...container.querySelectorAll("details")].map((details) =>
      details.getAttribute("name"),
    )
    expect(names).toEqual(["faq", "faq"])
  })
})
