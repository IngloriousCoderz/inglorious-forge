import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { tooltip } from "."

describe("tooltip", () => {
  it("renders tooltip bubble", () => {
    const props = {
      id: "tip",
      children: "Hover",
      content: "Details",
      size: "lg",
    }
    const container = document.createElement("div")

    render(tooltip.render(props), container)

    expect(
      container.querySelector(".iw-tooltip-bubble").textContent.trim(),
    ).toBe("Details")
    expect(
      container
        .querySelector(".iw-tooltip")
        .classList.contains("iw-tooltip-size-lg"),
    ).toBe(true)
  })
})
