import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { BeforeAfter } from "."

function setup(overrides = {}) {
  const entity = {
    id: "ba",
    type: "BeforeAfter",
    before: { src: "before.jpg", alt: "Before" },
    after: { src: "after.jpg", alt: "After" },
    position: 50,
    step: 1,
    ...overrides,
  }
  const api = createMockApi({ [entity.id]: entity })
  api.getType = () => BeforeAfter
  const container = document.createElement("div")

  render(BeforeAfter.render(entity, api), container)

  return { entity, api, container }
}

describe("before-after", () => {
  it("renders before and after images", () => {
    const { container } = setup()

    const before = container.querySelector(".iw-before-after-before img")
    const after = container.querySelector(".iw-before-after-after img")

    expect(before.getAttribute("src")).toBe("before.jpg")
    expect(before.getAttribute("alt")).toBe("Before")
    expect(after.getAttribute("src")).toBe("after.jpg")
    expect(after.getAttribute("alt")).toBe("After")
  })

  it("reflects position through the CSS custom property and ARIA", () => {
    const { container } = setup({ position: 30 })

    const root = container.querySelector(".iw-before-after")
    expect(root.style.getPropertyValue("--iw-before-after-position")).toBe(
      "30%",
    )
    expect(root.getAttribute("aria-valuenow")).toBe("30")
    expect(root.getAttribute("role")).toBe("slider")
  })

  it("moves the divider with the arrow keys", () => {
    const { container, api } = setup({ position: 50, step: 5 })

    const root = container.querySelector(".iw-before-after")
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))

    expect(api.getEvents()).toEqual([{ type: "#ba:setPosition", payload: 55 }])
  })

  it("jumps to the edges with Home and End", () => {
    const { container, api } = setup({ position: 40 })

    const root = container.querySelector(".iw-before-after")
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }))
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }))

    expect(api.getEvents()).toEqual([
      { type: "#ba:setPosition", payload: 100 },
      { type: "#ba:setPosition", payload: 0 },
    ])
  })

  it("does not respond to keys when disabled", () => {
    const { container, api } = setup({ isDisabled: true })

    const root = container.querySelector(".iw-before-after")
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))

    expect(api.getEvents()).toEqual([])
    expect(root.getAttribute("tabindex")).toBe("-1")
  })

  it("create initializes position and defaults", () => {
    const entity = { id: "ba" }

    BeforeAfter.create(entity)

    expect(entity.position).toBe(50)
    expect(entity.step).toBe(1)
    expect(entity.isDisabled).toBe(false)
  })

  it("setPosition clamps to the 0-100 range", () => {
    const entity = { id: "ba", position: 50 }

    BeforeAfter.setPosition(entity, 120)
    expect(entity.position).toBe(100)

    BeforeAfter.setPosition(entity, -20)
    expect(entity.position).toBe(0)

    BeforeAfter.setPosition(entity, 42)
    expect(entity.position).toBe(42)
  })

  it("setPosition ignores updates while disabled", () => {
    const entity = { id: "ba", position: 50, isDisabled: true }

    BeforeAfter.setPosition(entity, 10)

    expect(entity.position).toBe(50)
  })
})
