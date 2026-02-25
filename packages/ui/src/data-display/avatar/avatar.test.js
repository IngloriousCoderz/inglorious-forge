import { augmentType } from "@inglorious/store/types"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { avatar } from "."

describe("avatar", () => {
  const type = augmentType(avatar)

  it("renders initials", () => {
    const entity = { id: "av", initials: "AB" }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(container.querySelector(".iw-avatar").textContent.trim()).toBe("AB")
  })
})
