import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { speedDial } from "."

describe("speedDial", () => {
  it("renders trigger", () => {
    const container = document.createElement("div")

    render(speedDial.render({}), container)

    expect(container.querySelector(".iw-speed-dial-trigger")).not.toBeNull()
  })

  it("renders actions when open", () => {
    const container = document.createElement("div")

    render(
      speedDial.render({ isOpen: true, actions: [{ label: "A" }] }),
      container,
    )

    expect(container.querySelector(".iw-speed-dial-action")).not.toBeNull()
  })
})
