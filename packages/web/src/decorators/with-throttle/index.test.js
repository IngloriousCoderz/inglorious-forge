import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { withThrottle } from "."

/**
 * Builds a minimal fake `api` whose `getEntity` reads from a mutable store
 * object, so tests can simulate an entity being destroyed between calls.
 */
function createFakeApi(initialEntities) {
  const entities = { ...initialEntities }

  return {
    getEntity: (id) => entities[id],
    _destroy: (id) => delete entities[id],
    _entities: entities,
  }
}

describe("withThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("wraps only the named handlers, leaving others untouched", () => {
    const scroll = vi.fn()
    const untouched = vi.fn()
    const baseType = { scroll, untouched }

    const compose = withThrottle(100, ["scroll"])
    const behavior = compose(baseType)

    expect(behavior.scroll).toBeTypeOf("function")
    expect(behavior.untouched).toBeUndefined() // not re-wrapped, left to normal composition merge
  })

  it("skips handler names the base type doesn't define, without throwing", () => {
    const baseType = { scroll: vi.fn() }
    const compose = withThrottle({ scroll: 100, resize: 100 })

    expect(() => compose(baseType)).not.toThrow()
    const behavior = compose(baseType)
    expect(behavior.resize).toBeUndefined()
  })

  it("invokes the original handler immediately on the leading call", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"])
    const behavior = compose({ scroll: original })

    const api = createFakeApi({ e1: { id: "e1" } })
    behavior.scroll({ id: "e1" }, "payload-a", api)

    expect(original).toHaveBeenCalledTimes(1)
    expect(original).toHaveBeenCalledWith({ id: "e1" }, "payload-a", api)
  })

  it("suppresses calls within the delay window by default (no trailing)", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"])
    const behavior = compose({ scroll: original })
    const api = createFakeApi({ e1: { id: "e1" } })

    behavior.scroll({ id: "e1" }, "a", api)
    behavior.scroll({ id: "e1" }, "b", api)
    vi.advanceTimersByTime(100)

    expect(original).toHaveBeenCalledTimes(1)
    expect(original).toHaveBeenCalledWith({ id: "e1" }, "a", api)
  })

  it("fires a trailing call with the last payload when hasTrailing is true", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"], { hasTrailing: true })
    const behavior = compose({ scroll: original })
    const api = createFakeApi({ e1: { id: "e1" } })

    behavior.scroll({ id: "e1" }, "a", api)
    behavior.scroll({ id: "e1" }, "b", api)

    expect(original).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)

    expect(original).toHaveBeenCalledTimes(2)
    expect(original).toHaveBeenNthCalledWith(2, { id: "e1" }, "b", api)
  })

  it("re-fetches a live entity for the trailing call rather than reusing the stale draft", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"], { hasTrailing: true })
    const behavior = compose({ scroll: original })

    const staleDraft = { id: "e1", position: 0 }
    const liveEntity = { id: "e1", position: 999 }
    const api = createFakeApi({ e1: liveEntity })

    behavior.scroll(staleDraft, "a", api)
    vi.advanceTimersByTime(100) // close leading window, no trailing queued yet
    behavior.scroll(staleDraft, "b", api) // new leading call
    behavior.scroll(staleDraft, "c", api) // queues trailing

    vi.advanceTimersByTime(100)

    // the trailing invocation should receive the live entity from api.getEntity,
    // not the stale draft object that was passed into the handler
    expect(original).toHaveBeenLastCalledWith(liveEntity, "c", api)
  })

  it("does not invoke the original handler if the entity was destroyed before a trailing call fires", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"], { hasTrailing: true })
    const behavior = compose({ scroll: original })
    const api = createFakeApi({ e1: { id: "e1" } })

    behavior.scroll({ id: "e1" }, "a", api)
    behavior.scroll({ id: "e1" }, "b", api) // queues trailing call

    api._destroy("e1")
    vi.advanceTimersByTime(100)

    // leading call happened once; trailing call was skipped because the
    // entity no longer exists
    expect(original).toHaveBeenCalledTimes(1)
  })

  it("scopes throttling independently per entity", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"])
    const behavior = compose({ scroll: original })
    const api = createFakeApi({ e1: { id: "e1" }, e2: { id: "e2" } })

    behavior.scroll({ id: "e1" }, "a", api)
    behavior.scroll({ id: "e2" }, "b", api) // different entity, own window

    expect(original).toHaveBeenCalledTimes(2)
  })

  it("cancels pending throttles for an entity on destroy", () => {
    const original = vi.fn()
    const compose = withThrottle(100, ["scroll"], { hasTrailing: true })
    const behavior = compose({ scroll: original })
    const api = createFakeApi({ e1: { id: "e1" } })

    behavior.scroll({ id: "e1" }, "a", api)
    behavior.scroll({ id: "e1" }, "b", api) // queues a trailing call

    behavior.destroy({ id: "e1" }, undefined, api)
    vi.advanceTimersByTime(100)

    // trailing call must not fire after destroy cancelled it
    expect(original).toHaveBeenCalledTimes(1)
  })

  it("calls through to the base type's own destroy handler, if any", () => {
    const baseDestroy = vi.fn()
    const compose = withThrottle(100, ["scroll"])
    const behavior = compose({ scroll: vi.fn(), destroy: baseDestroy })
    const api = createFakeApi({ e1: { id: "e1" } })

    const entity = { id: "e1" }
    const payload = { reason: "unmount" }
    behavior.destroy(entity, payload, api)

    expect(baseDestroy).toHaveBeenCalledWith(entity, payload, api)
  })

  it("does not throw calling destroy when the entity was never throttled", () => {
    const compose = withThrottle(100, ["scroll"])
    const behavior = compose({ scroll: vi.fn() })
    const api = createFakeApi({ e1: { id: "e1" } })

    expect(() => behavior.destroy({ id: "e1" }, undefined, api)).not.toThrow()
  })
})
