import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { BottomNavigation } from "."

describe("bottomNavigation", () => {
  it("renders actions", () => {
    const container = document.createElement("div")

    render(
      BottomNavigation.render({ actions: [{ label: "A" }, { label: "B" }] }),
      container,
    )

    expect(
      container.querySelectorAll(".iw-bottom-navigation-action"),
    ).toHaveLength(2)
  })

  it("marks selected action", () => {
    const container = document.createElement("div")

    render(
      BottomNavigation.render({
        value: "a",
        actions: [{ value: "a", label: "A" }],
      }),
      container,
    )

    expect(
      container.querySelector(".iw-bottom-navigation-action-selected"),
    ).not.toBeNull()
  })
})
