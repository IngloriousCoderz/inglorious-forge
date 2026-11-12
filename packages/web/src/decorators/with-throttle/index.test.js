import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { withThrottle } from "."

const DELAY = 100

describe("withThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function storeWith(base, options, entities = { panel: { type: "Panel" } }) {
    return createStore({
      types: { Panel: [base, withThrottle(DELAY, ["resize"], options)] },
      entities,
    })
  }

  const resizes = {
    resize(entity, width) {
      entity.widths = [...(entity.widths ?? []), width]
    },
  }

  it("wraps only the named handlers, leaving others untouched", () => {
    const behavior = withThrottle(DELAY, ["resize"])({
      resize: vi.fn(),
      untouched: vi.fn(),
    })

    expect(behavior.resize).toBeTypeOf("function")
    expect(behavior.untouched).toBeUndefined()
  })

  it("skips handler names the base type doesn't define", () => {
    const behavior = withThrottle({ resize: DELAY, scroll: DELAY })({
      resize: vi.fn(),
    })

    expect(behavior.scroll).toBeUndefined()
  })

  it("runs the leading call at once, inside an update subscribers hear of", () => {
    const store = storeWith(resizes)
    const listener = vi.fn()
    store.subscribe(listener)

    store.notify("#panel:resize", 300)

    expect(store.getEntity("panel").widths).toEqual([300])
    expect(listener).toHaveBeenCalled()
  })

  it("drops calls within the delay by default", async () => {
    const store = storeWith(resizes)

    store.notify("#panel:resize", 300)
    store.notify("#panel:resize", 310)
    await vi.advanceTimersByTimeAsync(DELAY)

    expect(store.getEntity("panel").widths).toEqual([300])
  })

  it("runs a trailing call with the last payload, in an update of its own", async () => {
    const store = storeWith(resizes, { hasTrailing: true })
    const listener = vi.fn()

    store.notify("#panel:resize", 300)
    store.notify("#panel:resize", 310)
    store.notify("#panel:resize", 320)
    store.subscribe(listener)
    await vi.advanceTimersByTimeAsync(DELAY)

    expect(store.getEntity("panel").widths).toEqual([300, 320])
    expect(listener).toHaveBeenCalled()
  })

  it("does nothing for an entity removed before a trailing call", async () => {
    const store = storeWith(resizes, { hasTrailing: true })

    store.notify("#panel:resize", 300)
    store.notify("#panel:resize", 310)
    store.notify("remove", "panel")

    await expect(vi.advanceTimersByTimeAsync(DELAY)).resolves.not.toThrow()
    expect(store.getEntity("panel")).toBeUndefined()
  })

  it("throttles each entity on its own", () => {
    const store = storeWith(resizes, undefined, {
      left: { type: "Panel" },
      right: { type: "Panel" },
    })

    store.notify("#left:resize", 1)
    store.notify("#right:resize", 2)

    expect(store.getEntity("left").widths).toEqual([1])
    expect(store.getEntity("right").widths).toEqual([2])
  })

  it("cancels a pending trailing call on destroy, and calls the type's own destroy", async () => {
    const destroy = vi.fn()
    const behavior = withThrottle(DELAY, ["resize"], { hasTrailing: true })({
      resize: vi.fn(),
      destroy,
    })
    const api = { notify: vi.fn() }
    const entity = { id: "panel" }

    behavior.resize(entity, 1, api)
    behavior.resize(entity, 2, api)
    behavior.destroy(entity, undefined, api)
    await vi.advanceTimersByTimeAsync(DELAY)

    expect(api.notify).toHaveBeenCalledTimes(1)
    expect(destroy).toHaveBeenCalled()
  })

  it("does not throw on destroy when nothing was throttled", () => {
    const behavior = withThrottle(DELAY, ["resize"])({ resize: vi.fn() })

    expect(() => behavior.destroy({ id: "panel" }, undefined, {})).not.toThrow()
  })
})
