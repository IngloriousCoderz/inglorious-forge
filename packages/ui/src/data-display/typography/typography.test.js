import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { typography } from "."

describe("typography", () => {
  const type = augmentType(typography)

  it("renders heading variant", () => {
    const entity = { id: "typo", variant: "h2", children: "Heading" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(
      container.querySelector(".iw-typography-h2").textContent.trim(),
    ).toBe("Heading")
  })
})
