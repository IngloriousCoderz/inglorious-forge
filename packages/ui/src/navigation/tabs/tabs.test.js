import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

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

    expect(container.querySelector(".iw-tab-panel").textContent).toBe("Panel B")
  })
})
