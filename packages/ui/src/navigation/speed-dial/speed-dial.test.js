import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { SpeedDial } from "."

describe("speedDial", () => {
  it("renders trigger", () => {
    const container = document.createElement("div")

    render(SpeedDial.render({}), container)

    expect(container.querySelector(".iw-speed-dial-trigger")).not.toBeNull()
  })

  it("renders actions when open", () => {
    const container = document.createElement("div")

    render(
      SpeedDial.render({ isOpen: true, actions: [{ label: "A" }] }),
      container,
    )

    expect(container.querySelector(".iw-speed-dial-action")).not.toBeNull()
  })
})
