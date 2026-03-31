import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Flex } from "."

describe("flex", () => {
  it("renders children", () => {
    const entity = {
      id: "fx",
      children: [html`<div>A</div>`, html`<div>B</div>`],
    }
    const container = document.createElement("div")

    render(Flex.render(entity), container)

    expect(
      container.querySelector(".iw-flex").textContent.replace(/\s+/g, ""),
    ).toBe("AB")
  })

  it("applies layout modifier classes", () => {
    const entity = {
      id: "fx",
      element: "section",
      direction: "column",
      wrap: "wrap",
      justify: "center",
      align: "center",
      gap: "lg",
      padding: "md",
      isFullWidth: true,
    }
    const container = document.createElement("div")

    render(Flex.render(entity), container)

    const root = container.querySelector(".iw-flex")
    expect(root.tagName).toBe("SECTION")
    expect(root.classList.contains("iw-flex-direction-column")).toBe(true)
    expect(root.classList.contains("iw-flex-wrap-wrap")).toBe(true)
    expect(root.classList.contains("iw-flex-justify-center")).toBe(true)
    expect(root.classList.contains("iw-flex-align-center")).toBe(true)
    expect(root.classList.contains("iw-flex-gap-lg")).toBe(true)
    expect(root.classList.contains("iw-flex-padding-md")).toBe(true)
    expect(root.classList.contains("iw-flex-full-width")).toBe(true)
  })

  it("renders mixed child content", () => {
    const entity = {
      id: "fx",
      children: [html`<span>Configured Child</span>`, " + Text Child"],
    }
    const container = document.createElement("div")

    render(Flex.render(entity), container)

    expect(container.textContent).toContain("Configured Child + Text Child")
  })

  it("applies inline modifier and dispatches click", () => {
    let isClicked = false
    const entity = {
      id: "fx",
      isInline: true,
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(Flex.render(entity), container)

    const root = container.querySelector(".iw-flex")
    expect(root.classList.contains("iw-flex-inline")).toBe(true)
    root.click()
    expect(isClicked).toBe(true)
  })
})
