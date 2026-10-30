import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { withLiveReload } from "./index.js"

function fakeSource() {
  const listeners = new Map()
  return {
    subscribe: vi.fn((table, onChange) => {
      if (!listeners.has(table)) listeners.set(table, new Set())
      listeners.get(table).add(onChange)
      return () => listeners.get(table).delete(onChange)
    }),
    change(table) {
      listeners.get(table)?.forEach((onChange) => onChange())
    },
    count(table) {
      return listeners.get(table)?.size ?? 0
    },
  }
}

function fakeApi(entities) {
  return {
    getEntity: (id) => entities[id],
    notify: vi.fn(),
  }
}

describe("withLiveReload", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("reloads the entity once for a burst of changes to any of its tables", () => {
    const source = fakeSource()
    const behavior = withLiveReload({
      source,
      tables: ["applications", "events"],
      payload: (entity) => entity.eventId,
    })({})
    const entity = { id: "received", eventId: "e1" }
    const api = fakeApi({ received: entity })

    behavior.create(entity, undefined, api)
    source.change("applications")
    source.change("events")
    source.change("applications")
    expect(api.notify).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(api.notify).toHaveBeenCalledTimes(1)
    expect(api.notify).toHaveBeenCalledWith("#received:load", "e1")
  })

  it("reads the live entity when the change comes", () => {
    const source = fakeSource()
    const entities = { detail: { id: "detail", recordId: "r1" } }
    const api = fakeApi(entities)
    const behavior = withLiveReload({
      source,
      tables: ["records"],
      event: "refresh",
      payload: (entity) => entity.recordId,
      delay: 50,
    })({})

    behavior.create(entities.detail, undefined, api)
    entities.detail = { id: "detail", recordId: "r2" }
    source.change("records")
    vi.advanceTimersByTime(50)

    expect(api.notify).toHaveBeenCalledWith("#detail:refresh", "r2")
  })

  it("skips a change while the entity is not on screen", () => {
    const source = fakeSource()
    const entities = { page: { id: "page", isOpen: false } }
    const api = fakeApi(entities)
    const behavior = withLiveReload({
      source,
      tables: ["records"],
      isLive: (entity) => entity.isOpen,
    })({})

    behavior.create(entities.page, undefined, api)
    source.change("records")
    vi.advanceTimersByTime(300)
    expect(api.notify).not.toHaveBeenCalled()

    entities.page = { id: "page", isOpen: true }
    source.change("records")
    vi.advanceTimersByTime(300)
    expect(api.notify).toHaveBeenCalledWith("#page:load", undefined)
  })

  it("keeps the type's own create and destroy, and lets go on destroy", () => {
    const source = fakeSource()
    const create = vi.fn()
    const destroy = vi.fn()
    const behavior = withLiveReload({ source, tables: ["records"] })({
      create,
      destroy,
    })
    const entity = { id: "list" }
    const api = fakeApi({ list: entity })

    behavior.create(entity, "created", api)
    expect(create).toHaveBeenCalledWith(entity, "created", api)
    expect(source.count("records")).toBe(1)

    source.change("records")
    behavior.destroy(entity, "destroyed", api)
    vi.advanceTimersByTime(300)

    expect(destroy).toHaveBeenCalledWith(entity, "destroyed", api)
    expect(source.count("records")).toBe(0)
    expect(api.notify).not.toHaveBeenCalled()
  })

  it("reloads when the page comes back into view", () => {
    const visibility = new EventTarget()
    visibility.visibilityState = "hidden"
    vi.stubGlobal("document", visibility)
    try {
      const behavior = withLiveReload({
        source: fakeSource(),
        tables: ["records"],
      })({})
      const entity = { id: "list" }
      const api = fakeApi({ list: entity })
      behavior.create(entity, undefined, api)

      visibility.dispatchEvent(new Event("visibilitychange"))
      vi.advanceTimersByTime(300)
      expect(api.notify).not.toHaveBeenCalled()

      visibility.visibilityState = "visible"
      visibility.dispatchEvent(new Event("visibilitychange"))
      vi.advanceTimersByTime(300)
      expect(api.notify).toHaveBeenCalledWith("#list:load", undefined)

      behavior.destroy(entity, undefined, api)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it("subscribes once per entity, even if it is created again", () => {
    const source = fakeSource()
    const behavior = withLiveReload({ source, tables: ["records"] })({})
    const entity = { id: "list" }
    const api = fakeApi({ list: entity })

    behavior.create(entity, undefined, api)
    behavior.create(entity, undefined, api)

    expect(source.count("records")).toBe(1)
  })
})
