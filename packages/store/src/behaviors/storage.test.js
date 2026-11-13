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

  describe("with a storage that answers later", () => {
    function asyncStorage(initial = {}) {
      const storage = memoryStorage(initial)
      const answers = []
      return {
        ...storage,
        getItem: vi.fn(
          (key) =>
            new Promise((resolve) =>
              answers.push(() => resolve(storage.getItem(key))),
            ),
        ),
        setItem: vi.fn((key, value) => {
          storage.items.set(key, value)
          return Promise.resolve()
        }),
        answer: () => answers.splice(0).forEach((answer) => answer()),
      }
    }

    it("starts with the defaults and restores the fields when it answers", async () => {
      const storage = asyncStorage({ settings: '{"theme":"dark"}' })
      const store = storeWith(storage)

      expect(store.getEntity("settings").theme).toBe("light")
      expect(storage.setItem).not.toHaveBeenCalled()

      storage.answer()
      await vi.waitFor(() =>
        expect(store.getEntity("settings").theme).toBe("dark"),
      )
      expect(storage.setItem).not.toHaveBeenCalled()
    })

    it("keeps a change made while waiting, and saves it", async () => {
      const storage = asyncStorage({ settings: '{"theme":"dark"}' })
      const store = storeWith(storage)

      store.notify("#settings:themeSet", "blue")
      expect(storage.setItem).not.toHaveBeenCalled()

      storage.answer()
      await vi.waitFor(() =>
        expect(storage.items.get("settings")).toBe('{"theme":"blue"}'),
      )
      expect(store.getEntity("settings").theme).toBe("blue")
    })

    it("tells the type what came back", async () => {
      const storage = asyncStorage({ settings: '{"theme":"dark"}' })
      const storageRestore = vi.fn()
      const store = createStore({
        types: {
          Settings: [
            { ...Settings, storageRestore },
            withStorage(["theme"], { storage: () => storage }),
          ],
        },
        entities: { settings: { type: "Settings" } },
      })

      storage.answer()
      await vi.waitFor(() => expect(storageRestore).toHaveBeenCalled())
      expect(storageRestore.mock.calls[0][1]).toEqual({ theme: "dark" })
      expect(store.getEntity("settings").theme).toBe("dark")
    })

    it("starts over when the storage fails", async () => {
      const storage = {
        getItem: () => Promise.reject(new Error("unavailable")),
        setItem: vi.fn(() => Promise.reject(new Error("unavailable"))),
      }
      const store = storeWith(storage)

      await vi.waitFor(() =>
        expect(storage.setItem).toHaveBeenCalledWith(
          "settings",
          '{"theme":"light"}',
        ),
      )
      store.notify("#settings:themeSet", "dark")
      expect(store.getEntity("settings").theme).toBe("dark")
    })

    it("restores each of several decorators on one type", async () => {
      const preferences = asyncStorage({ settings: '{"theme":"dark"}' })
      const tab = asyncStorage({ settings: '{"draft":"Dear diary"}' })
      const session = memoryStorage({ settings: '{"isMenuOpen":true}' })
      const storageRestore = vi.fn()
      const store = createStore({
        types: {
          Settings: [
            { ...Settings, storageRestore },
            withStorage(["theme"], { storage: () => preferences }),
            withStorage(["draft"], { storage: () => tab }),
            withStorage(["isMenuOpen"], { storage: () => session }),
          ],
        },
        entities: { settings: { type: "Settings" } },
      })

      tab.answer()
      preferences.answer()
      await vi.waitFor(() => expect(storageRestore).toHaveBeenCalledTimes(2))

      expect(store.getEntity("settings")).toMatchObject({
        theme: "dark",
        draft: "Dear diary",
        isMenuOpen: true,
      })
      expect(storageRestore.mock.calls.map(([, restored]) => restored)).toEqual(
        [{ draft: "Dear diary" }, { theme: "dark" }],
      )
      expect(preferences.items.get("settings")).toBe('{"theme":"dark"}')
      expect(tab.items.get("settings")).toBe('{"draft":"Dear diary"}')
    })
  })
})
