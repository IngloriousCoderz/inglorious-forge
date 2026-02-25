import { augmentType } from "@inglorious/store/types"
import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { flex } from "."

describe("flex", () => {
  const type = augmentType(flex)

  it("renders children", () => {
    const entity = {
      id: "fx",
      children: [html`<div>A</div>`, html`<div>B</div>`],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(
      container.querySelector(".iw-flex").textContent.replace(/\s+/g, ""),
    ).toBe("AB")
  })

  it("applies layout modifier classes", () => {
    const entity = {
      id: "fx",
      direction: "column",
      wrap: "wrap",
      justify: "center",
      align: "center",
      gap: "lg",
      fullWidth: true,
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    const root = container.querySelector(".iw-flex")
    expect(root.classList.contains("iw-flex-direction-column")).toBe(true)
    expect(root.classList.contains("iw-flex-wrap-wrap")).toBe(true)
    expect(root.classList.contains("iw-flex-justify-center")).toBe(true)
    expect(root.classList.contains("iw-flex-align-center")).toBe(true)
    expect(root.classList.contains("iw-flex-gap-lg")).toBe(true)
    expect(root.classList.contains("iw-flex-full-width")).toBe(true)
  })

  it("renders mixed child content", () => {
    const entity = {
      id: "fx",
      children: [html`<span>Configured Child</span>`, " + Text Child"],
    }
    const api = createMockApi({ [entity.id]: entity })
    const container = document.createElement("div")

    render(type.render(entity, api), container)

    expect(container.textContent).toContain("Configured Child + Text Child")
  })
})
