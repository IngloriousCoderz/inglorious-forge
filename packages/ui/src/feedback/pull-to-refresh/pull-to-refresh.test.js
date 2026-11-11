import { haptics } from "@inglorious/web/haptics"
import { render } from "@inglorious/web/test"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PullToRefresh } from "."

describe("PullToRefresh", () => {
  afterEach(() => {
    document.body.replaceChildren()
    document.documentElement.scrollTop = 0
  })

  it("refreshes when pulled past the threshold and let go", () => {
    const onRefresh = vi.fn()
    const element = mount(PullToRefresh.render({ onRefresh, children: "List" }))

    touch(element, "touchstart", 100)
    touch(element, "touchmove", 300)
    expect(element.style.getPropertyValue("--iw-pull-distance")).toBe("100px")
    expect(element.classList.contains("iw-pull-to-refresh-armed")).toBe(true)

    touch(element, "touchend")

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(element.style.getPropertyValue("--iw-pull-distance")).toBe("")
  })

  it("ticks once when letting go would refresh", () => {
    const selection = vi
      .spyOn(haptics, "selection")
      .mockImplementation(() => {})
    const element = mount(PullToRefresh.render({ onRefresh: () => {} }))

    touch(element, "touchstart", 100)
    touch(element, "touchmove", 200)
    touch(element, "touchmove", 300)
    touch(element, "touchmove", 320)

    expect(selection).toHaveBeenCalledTimes(1)
    selection.mockRestore()
  })

  it("lets a short pull go without refreshing", () => {
    const onRefresh = vi.fn()
    const element = mount(PullToRefresh.render({ onRefresh }))

    touch(element, "touchstart", 100)
    touch(element, "touchmove", 160)
    touch(element, "touchend")

    expect(onRefresh).not.toHaveBeenCalled()
  })

  it("stops the page from scrolling only while pulling down", () => {
    const element = mount(PullToRefresh.render({ onRefresh: () => {} }))

    touch(element, "touchstart", 100)
    const down = touch(element, "touchmove", 200)
    touch(element, "touchend")
    touch(element, "touchstart", 300)
    const up = touch(element, "touchmove", 200)

    expect(down.defaultPrevented).toBe(true)
    expect(up.defaultPrevented).toBe(false)
  })

  it("leaves the gesture to scrolling when the page is not at the top", () => {
    document.documentElement.scrollTop = 50
    const onRefresh = vi.fn()
    const element = mount(PullToRefresh.render({ onRefresh }))

    touch(element, "touchstart", 100)
    const move = touch(element, "touchmove", 400)
    touch(element, "touchend")

    expect(move.defaultPrevented).toBe(false)
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it("can't be pulled while refreshing, and says it is busy", () => {
    const onRefresh = vi.fn()
    const element = mount(
      PullToRefresh.render({ onRefresh, isRefreshing: true }),
    )

    touch(element, "touchstart", 100)
    touch(element, "touchmove", 400)
    touch(element, "touchend")

    expect(onRefresh).not.toHaveBeenCalled()
    expect(element.getAttribute("aria-busy")).toBe("true")
    expect(element.classList.contains("iw-pull-to-refresh-refreshing")).toBe(
      true,
    )
  })
})

function mount(template) {
  const container = document.createElement("div")
  document.body.append(container)
  render(template, container)
  return container.querySelector(".iw-pull-to-refresh")
}

function touch(target, type, clientY) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const touches = clientY == null ? [] : [{ clientY }]
  Object.defineProperty(event, "touches", { value: touches })
  target.dispatchEvent(event)
  return event
}
