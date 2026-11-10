import { afterEach, describe, expect, it, vi } from "vitest"

import { anchorFallback } from "./anchor.js"

const VIEWPORT_WIDTH = 400
const VIEWPORT_HEIGHT = 800

describe("anchorFallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it("leaves placement to CSS where anchor positioning works", () => {
    const { anchor, popover } = setup({
      top: 100,
      left: 20,
      width: 200,
      height: 40,
    })
    vi.stubGlobal("CSS", { supports: () => true })

    anchorFallback(popover, {
      getAnchor: () => anchor,
      placement: "bottom-start",
    })
    open(popover)

    expect(popover.style.top).toBe("")
  })

  it("places the popover under its anchor, matching its width", () => {
    const { anchor, popover } = setup({
      top: 100,
      left: 20,
      width: 200,
      height: 40,
    })

    anchorFallback(popover, {
      getAnchor: () => anchor,
      placement: "bottom-start",
      isWidthMatched: true,
    })
    open(popover)

    expect(popover.style.top).toBe("140px")
    expect(popover.style.left).toBe("20px")
    expect(popover.style.width).toBe("200px")
  })

  it("flips above the anchor when there is no room below", () => {
    const { anchor, popover } = setup(
      { top: 700, left: 20, width: 200, height: 40 },
      300,
    )

    anchorFallback(popover, {
      getAnchor: () => anchor,
      placement: "bottom-start",
    })
    open(popover)

    expect(popover.style.top).toBe("")
    expect(popover.style.bottom).toBe("100px")
  })

  it("centers the popover above its anchor", () => {
    const { anchor, popover } = setup({
      top: 600,
      left: 300,
      width: 48,
      height: 48,
    })

    anchorFallback(popover, { getAnchor: () => anchor, placement: "top" })
    open(popover)

    expect(popover.style.bottom).toBe("200px")
    expect(popover.style.left).toBe("324px")
    expect(popover.style.translate).toBe("-50%")
  })

  it("follows the anchor while open", () => {
    const { anchor, popover } = setup({
      top: 100,
      left: 20,
      width: 200,
      height: 40,
    })
    anchorFallback(popover, {
      getAnchor: () => anchor,
      placement: "bottom-start",
    })
    open(popover)

    stubRect(anchor, { top: 50, left: 20, width: 200, height: 40 })
    window.dispatchEvent(new Event("scroll"))

    expect(popover.style.top).toBe("90px")
  })
})

function setup(rect, popoverHeight = 0) {
  vi.stubGlobal("CSS", { supports: () => false })
  vi.stubGlobal("innerWidth", VIEWPORT_WIDTH)
  vi.stubGlobal("innerHeight", VIEWPORT_HEIGHT)

  const anchor = document.createElement("button")
  const popover = document.createElement("div")
  Object.defineProperty(popover, "offsetHeight", { value: popoverHeight })
  stubRect(anchor, rect)
  document.body.append(anchor, popover)
  return { anchor, popover }
}

function stubRect(element, { top, left, width, height }) {
  element.getBoundingClientRect = () => ({
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
  })
}

function open(popover) {
  popover.dispatchEvent(
    Object.assign(new Event("toggle"), { newState: "open" }),
  )
}
