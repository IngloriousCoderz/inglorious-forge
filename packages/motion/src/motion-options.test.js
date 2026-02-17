import { describe, expect, it } from "vitest"

import {
  getLayoutId,
  getPresenceGroup,
  resolveLayoutOptions,
  resolvePresenceOptions,
} from "./motion-options.js"

describe("motion-options", () => {
  it("resolves layout defaults", () => {
    expect(resolveLayoutOptions(false)).toBeNull()
    expect(resolveLayoutOptions(true)).toEqual({
      duration: 260,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    })
  })

  it("resolves custom layout config", () => {
    expect(resolveLayoutOptions({ duration: 150 })).toEqual({
      duration: 150,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    })
  })

  it("resolves presence defaults and custom values", () => {
    expect(resolvePresenceOptions()).toEqual({
      groupKey: "motionPresenceGroup",
      mode: "sync",
    })

    expect(resolvePresenceOptions({ mode: "wait", groupKey: "demo" })).toEqual({
      groupKey: "demo",
      mode: "wait",
    })
  })

  it("reads ids from entity keys", () => {
    const entity = { motionLayoutId: "hero", motionPresenceGroup: "toasts" }

    expect(getLayoutId(entity, "motionLayoutId")).toBe("hero")
    expect(getLayoutId(entity, "missing")).toBeNull()
    expect(getPresenceGroup(entity, "motionPresenceGroup")).toBe("toasts")
  })
})
