import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { haptics } from "./index.js"

describe("haptics", () => {
  let vibrate

  beforeEach(() => {
    vibrate = vi.fn(() => true)
    vi.stubGlobal("navigator", { vibrate })
  })

  afterEach(() => {
    haptics.use(null)
    vi.unstubAllGlobals()
  })

  it("vibrates without the native plugin", () => {
    expect(haptics.selection()).toBe(true)
    haptics.impact("heavy")
    haptics.notification("error")

    expect(vibrate.mock.calls).toEqual([[[20]], [[70]], [[70, 80, 70, 80, 70]]])
  })

  it("says when the browser refuses, as Chrome does before a tap", () => {
    vibrate.mockReturnValue(false)

    expect(haptics.impact()).toBe(false)
  })

  it("does nothing where the browser can't vibrate", () => {
    vi.stubGlobal("navigator", {})

    expect(haptics.impact()).toBe(false)
  })

  it("plays the system's haptics through the plugin", async () => {
    const plugin = {
      impact: vi.fn(async () => {}),
      notification: vi.fn(async () => {}),
    }
    haptics.use(plugin)

    expect(haptics.selection()).toBe(true)
    haptics.impact()
    haptics.notification("warning")
    await Promise.resolve()

    expect(plugin.impact.mock.calls).toEqual([
      [{ style: "LIGHT" }],
      [{ style: "MEDIUM" }],
    ])
    expect(plugin.notification).toHaveBeenCalledWith({ type: "WARNING" })
    expect(vibrate).not.toHaveBeenCalled()
  })

  it("swallows the plugin's failures", async () => {
    haptics.use({ impact: vi.fn(async () => Promise.reject(new Error("no"))) })

    haptics.impact()
    await new Promise((resolve) => setTimeout(resolve))
  })
})
