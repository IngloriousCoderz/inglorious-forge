import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Breadcrumbs } from "."

describe("breadcrumbs", () => {
  it("renders all items", () => {
    const container = document.createElement("div")

    render(
      Breadcrumbs.render({
        items: [{ label: "A", href: "#" }, { label: "B" }],
      }),
      container,
    )

    expect(container.querySelectorAll(".iw-breadcrumbs-item")).toHaveLength(2)
  })

  it("marks the last item as current", () => {
    const container = document.createElement("div")

    render(
      Breadcrumbs.render({ items: [{ label: "A" }, { label: "B" }] }),
      container,
    )

    expect(
      container.querySelector(".iw-breadcrumbs-current").textContent.trim(),
    ).toBe("B")
  })
})
