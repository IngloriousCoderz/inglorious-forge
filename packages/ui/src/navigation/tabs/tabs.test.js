import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { Tabs } from "."

describe("tabs", () => {
  it("renders tabs", () => {
    const container = document.createElement("div")

    render(Tabs.render({ items: [{ label: "A" }, { label: "B" }] }), container)

    expect(container.querySelectorAll(".iw-tab")).toHaveLength(2)
  })

  it("renders the selected panel", () => {
    const container = document.createElement("div")

    render(
      Tabs.render({
        value: "b",
        items: [
          { value: "a", label: "A", panel: "Panel A" },
          { value: "b", label: "B", panel: "Panel B" },
        ],
      }),
      container,
    )

    expect(container.querySelector(".iw-tab-panel").textContent.trim()).toBe(
      "Panel B",
    )
  })

  it("selects no tab when value is null", () => {
    const container = document.createElement("div")

    render(
      Tabs.render({
        value: null,
        items: [
          { value: "a", label: "A", panel: "Panel A" },
          { value: "b", label: "B", panel: "Panel B" },
        ],
      }),
      container,
    )

    expect(container.querySelector(".iw-tab-selected")).toBeNull()
    expect(container.querySelector(".iw-tab-panel")).toBeNull()
  })

  it("keeps only the selected tab in the Tab order", () => {
    const container = document.createElement("div")

    render(
      Tabs.render({
        value: "b",
        items: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      }),
      container,
    )

    const tabindexes = [...container.querySelectorAll(".iw-tab")].map((tab) =>
      tab.getAttribute("tabindex"),
    )
    expect(tabindexes).toEqual(["-1", "0"])
  })

  it("links the selected tab and its panel by id", () => {
    const container = document.createElement("div")

    render(
      Tabs.render({
        id: "settings",
        value: "b",
        items: [
          { value: "a", label: "A", panel: "Panel A" },
          { value: "b", label: "B", panel: "Panel B" },
        ],
      }),
      container,
    )

    const tab = container.querySelector(".iw-tab-selected")
    const panel = container.querySelector(".iw-tab-panel")
    expect(tab.getAttribute("aria-controls")).toBe(panel.id)
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id)
  })

  it("moves to the next tab with the arrow keys, wrapping and skipping disabled ones", () => {
    const onChange = vi.fn()
    const container = document.createElement("div")
    document.body.append(container)

    render(
      Tabs.render({
        value: "c",
        onChange,
        items: [
          { value: "a", label: "A" },
          { value: "b", label: "B", isDisabled: true },
          { value: "c", label: "C" },
        ],
      }),
      container,
    )

    const [first, , last] = container.querySelectorAll(".iw-tab")
    last.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    )

    expect(onChange).toHaveBeenCalledWith("a")
    expect(document.activeElement).toBe(first)
    container.remove()
  })
})
