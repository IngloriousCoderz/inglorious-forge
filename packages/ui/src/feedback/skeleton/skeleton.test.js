import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Skeleton } from "."

describe("skeleton", () => {
  it("renders multiline skeleton", () => {
    const props = { lines: 3 }
    const container = document.createElement("div")

    render(Skeleton.render(props), container)

    expect(container.querySelectorAll(".iw-skeleton").length).toBe(3)
  })

  it("applies circle variant", () => {
    const props = { variant: "circle", width: 24, height: 24 }
    const container = document.createElement("div")

    render(Skeleton.render(props), container)

    expect(container.querySelector(".iw-skeleton-circle")).not.toBeNull()
  })
})
