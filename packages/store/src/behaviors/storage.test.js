import { describe, expect, it, vi } from "vitest"

import { createStore } from "../store.js"
import { withStorage } from "./storage.js"

function memoryStorage(initial = {}) {
  const items = new Map(Object.entries(initial))
  return {
    getItem: vi.fn((key) => (items.has(key) ? items.get(key) : null)),
    setItem: vi.fn((key, value) => items.set(key, value)),
    items,
  }
}

const Settings = {
  create(entity) {
    entity.theme ??= "light"
    entity.isMenuOpen ??= false
  },
  themeSet(entity, theme) {
    entity.theme = theme
  },
  menuToggle(entity) {
    entity.isMenuOpen = !entity.isMenuOpen
  },
  renderTitle(props) {
    return props.title
  },
}

function storeWith(storage, options = {}) {
  return createStore({
    types: {
      Settings: [
        Settings,
        withStorage(["theme"], { storage: () => storage, ...options }),
      ],
    },
    entities: { settings: { type: "Settings" } },
  })
}

describe("withStorage", () => {
  it("brings the fields back before the type's own defaults", () => {
    const storage = memoryStorage({ settings: '{"theme":"dark"}' })

    const store = storeWith(storage)

    expect(store.getEntity("settings")).toMatchObject({
      theme: "dark",
      isMenuOpen: false,
    })
  })

  it("keeps a field when a handler changes it, and only then", () => {
    const storage = memoryStorage({ settings: '{"theme":"light"}' })
    const store = storeWith(storage)

    store.notify("#settings:menuToggle")
    expect(storage.setItem).not.toHaveBeenCalled()

    store.notify("#settings:themeSet", "dark")
    expect(storage.items.get("settings")).toBe('{"theme":"dark"}')
    expect(storage.setItem).toHaveBeenCalledTimes(1)
  })

  it("keeps only the fields it was given", () => {
    const storage = memoryStorage()
    const store = storeWith(storage)

    store.notify("#settings:menuToggle")
    store.notify("#settings:themeSet", "dark")

    expect(JSON.parse(storage.items.get("settings"))).toEqual({ theme: "dark" })
  })

  it("leaves the type's helpers alone", () => {
    const behavior = withStorage(["theme"])(Settings)

    expect(behavior.renderTitle).toBeUndefined()
  })

  it("takes a key of its own, or one from the entity", () => {
    const storage = memoryStorage()
    const store = storeWith(storage, { key: (entity) => `app-${entity.id}` })

    store.notify("#settings:themeSet", "dark")

    expect(storage.items.has("app-settings")).toBe(true)
  })

  it("starts over when what is kept can't be read", () => {
    const storage = memoryStorage({ settings: "{not json" })

    expect(storeWith(storage).getEntity("settings").theme).toBe("light")
  })

  it("works on without storage, keeping nothing", () => {
    const failing = {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
    }
    const store = storeWith(failing)

    store.notify("#settings:themeSet", "dark")

    expect(store.getEntity("settings").theme).toBe("dark")
  })
})
