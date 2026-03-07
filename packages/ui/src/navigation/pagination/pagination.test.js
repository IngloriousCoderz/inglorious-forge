import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { pagination } from "."

describe("pagination", () => {
  it("renders pages and controls", () => {
    const container = document.createElement("div")

    render(pagination.render({ page: 2, count: 5 }), container)

    expect(
      container.querySelectorAll(".iw-pagination-item").length,
    ).toBeGreaterThan(4)
  })

  it("marks current page", () => {
    const container = document.createElement("div")

    render(pagination.render({ page: 3, count: 5 }), container)

    expect(
      container.querySelector(".iw-pagination-item-current").textContent.trim(),
    ).toBe("3")
  })

  it("fires onChange", () => {
    let nextPage = null
    const container = document.createElement("div")

    render(
      pagination.render({
        page: 1,
        count: 5,
        onChange: (value) => (nextPage = value),
      }),
      container,
    )

    container.querySelectorAll(".iw-pagination-item")[1].click()
    expect(nextPage).not.toBeNull()
  })
})
