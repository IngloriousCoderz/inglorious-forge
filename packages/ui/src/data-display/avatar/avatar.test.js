import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { avatar } from "."

describe("avatar", () => {
  it("renders initials", () => {
    const props = { id: "av", initials: "AB" }
    const container = document.createElement("div")

    render(avatar.render(props), container)

    expect(container.querySelector(".iw-avatar").textContent.trim()).toBe("AB")
  })
})
