import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { tooltip } from "."

describe("tooltip", () => {
  const type = augmentType(tooltip)

  it("renders tooltip bubble", () => {
    const entity = {
      id: "tip",
      children: "Hover",
      content: "Details",
      size: "lg",
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

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
