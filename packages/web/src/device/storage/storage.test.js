import { afterEach, describe, expect, it, vi } from "vitest"

import { createNativeStorage, createSecureStorage } from "./index.js"

describe("createNativeStorage", () => {
  function preferences(initial = {}) {
    const items = new Map(Object.entries(initial))
    return {
      get: vi.fn(async ({ key }) => ({ value: items.get(key) ?? null })),
      set: vi.fn(async ({ key, value }) => {
        items.set(key, value)
      }),
      remove: vi.fn(async ({ key }) => {
        items.delete(key)
      }),
      items,
    }
  }

  afterEach(() => {
    delete globalThis.Capacitor
    delete globalThis.localStorage
  })

  it("uses localStorage in a browser, whichever it is at the time", () => {
    const plugin = preferences()
    const storage = createNativeStorage({ plugin })
    const items = new Map()
    globalThis.localStorage = {
      getItem: (key) => items.get(key) ?? null,
      setItem: (key, value) => items.set(key, value),
      removeItem: (key) => items.delete(key),
    }

    storage.setItem("theme", "dark")
    expect(storage.getItem("theme")).toBe("dark")
    storage.removeItem("theme")

    expect(items.has("theme")).toBe(false)
    expect(plugin.get).not.toHaveBeenCalled()
  })

  it("uses Preferences in a native app", async () => {
    globalThis.Capacitor = { isNativePlatform: () => true }
    const plugin = preferences({ theme: "dark" })
    const storage = createNativeStorage({ plugin })

    await expect(storage.getItem("theme")).resolves.toBe("dark")
    await storage.setItem("theme", "light")
    expect(plugin.items.get("theme")).toBe("light")

    await storage.removeItem("theme")
    await expect(storage.getItem("theme")).resolves.toBe(null)
  })
})

describe("createSecureStorage", () => {
  afterEach(() => {
    delete globalThis.Capacitor
  })

  it("keeps secrets in the Keychain in a native app", async () => {
    globalThis.Capacitor = { isNativePlatform: () => true }
    const items = new Map()
    const plugin = {
      getData: vi.fn(async ({ key }) => {
        if (!items.has(key)) throw new Error("No data found")
        return { value: items.get(key) }
      }),
      setData: vi.fn(async ({ key, value }) => {
        items.set(key, value)
      }),
      deleteData: vi.fn(async ({ key }) => {
        items.delete(key)
      }),
    }
    const storage = createSecureStorage({ plugin })

    await expect(storage.getItem("token")).resolves.toBe(null)
    await storage.setItem("token", "secret")
    await expect(storage.getItem("token")).resolves.toBe("secret")
    await storage.removeItem("token")
    expect(items.has("token")).toBe(false)
  })

  it("uses localStorage in a browser", () => {
    const items = new Map()
    globalThis.localStorage = {
      getItem: (key) => items.get(key) ?? null,
      setItem: (key, value) => items.set(key, value),
    }

    createSecureStorage({ plugin: {} }).setItem("token", "secret")

    expect(items.get("token")).toBe("secret")
    delete globalThis.localStorage
  })
})
