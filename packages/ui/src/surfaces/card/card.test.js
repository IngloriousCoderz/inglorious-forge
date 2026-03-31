import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Card } from "."

describe("card", () => {
  it("renders title and subtitle", () => {
    const container = document.createElement("div")

    render(
      Card.render({ title: "Title", subtitle: "Subtitle", element: "section" }),
      container,
    )

    expect(container.querySelector(".iw-card-title").textContent).toBe("Title")
    expect(container.querySelector(".iw-card-subtitle").textContent).toBe(
      "Subtitle",
    )
    expect(container.querySelector(".iw-card").tagName).toBe("SECTION")
  })

  it("renders body and footer", () => {
    const container = document.createElement("div")

    render(
      Card.render({
        title: "Title",
        children: "Body",
        headerPadding: "none",
        bodyPadding: "sm",
        footerPadding: "lg",
        footer: html`<span>Footer</span>`,
      }),
      container,
    )

    expect(
      container
        .querySelector(".iw-card-header")
        .classList.contains("iw-card-header-padding-none"),
    ).toBe(true)
    expect(container.querySelector(".iw-card-body").textContent.trim()).toBe(
      "Body",
    )
    expect(
      container
        .querySelector(".iw-card-body")
        .classList.contains("iw-card-body-padding-sm"),
    ).toBe(true)
    expect(container.querySelector(".iw-card-footer").textContent.trim()).toBe(
      "Footer",
    )
    expect(
      container
        .querySelector(".iw-card-footer")
        .classList.contains("iw-card-footer-padding-lg"),
    ).toBe(true)
  })

  it("applies modifier classes and click handler", () => {
    let clicked = false
    const container = document.createElement("div")

    render(
      Card.render({
        isHoverable: true,
        isClickable: true,
        isFullWidth: true,
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
