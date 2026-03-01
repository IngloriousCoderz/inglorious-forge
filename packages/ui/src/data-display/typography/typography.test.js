import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { typography } from "."

describe("typography", () => {
  it("renders heading variant", () => {
    const props = { id: "typo", variant: "h2", children: "Heading" }
    const container = document.createElement("div")

    render(typography.render(props), container)

    expect(
      container.querySelector(".iw-typography-h2").textContent.trim(),
    ).toBe("Heading")
  })
})
