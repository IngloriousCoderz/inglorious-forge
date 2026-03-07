import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { card } from "."

describe("card", () => {
  it("renders title and subtitle", () => {
    const container = document.createElement("div")

    render(card.render({ title: "Title", subtitle: "Subtitle" }), container)

    expect(container.querySelector(".iw-card-title").textContent).toBe("Title")
    expect(container.querySelector(".iw-card-subtitle").textContent).toBe(
      "Subtitle",
    )
  })

  it("renders body and footer", () => {
    const container = document.createElement("div")

    render(
      card.render({
        children: "Body",
        footer: html`<span>Footer</span>`,
      }),
      container,
    )

    expect(container.querySelector(".iw-card-body").textContent.trim()).toBe(
      "Body",
    )
    expect(container.querySelector(".iw-card-footer").textContent.trim()).toBe(
      "Footer",
    )
  })

  it("applies modifier classes and click handler", () => {
    let clicked = false
    const container = document.createElement("div")

    render(
      card.render({
        hoverable: true,
        clickable: true,
        fullWidth: true,
        onClick: () => (clicked = true),
      }),
      container,
    )

    const root = container.querySelector(".iw-card")
    expect(root.classList.contains("iw-card-hoverable")).toBe(true)
    expect(root.classList.contains("iw-card-clickable")).toBe(true)
    expect(root.classList.contains("iw-card-full-width")).toBe(true)

    root.click()
    expect(clicked).toBe(true)
  })
})
