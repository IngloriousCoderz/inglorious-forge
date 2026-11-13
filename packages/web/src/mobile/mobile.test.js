import { afterEach, describe, expect, it, vi } from "vitest"

import { createNativeStorage, isNative } from "."

describe("mobile", () => {
  afterEach(() => {
    delete globalThis.Capacitor
    delete globalThis.window
  })

  it("should return false outside Capacitor", () => {
    expect(isNative()).toBe(false)
  })

  it("should use Capacitor isNativePlatform when available", () => {
    globalThis.Capacitor = {
      isNativePlatform: () => true,
    }

    expect(isNative()).toBe(true)
  })

  it("should detect native platforms from getPlatform", () => {
    globalThis.Capacitor = {
      getPlatform: () => "ios",
    }

    expect(isNative()).toBe(true)
  })

  it("should treat web platform as non-native", () => {
    globalThis.Capacitor = {
      getPlatform: () => "web",
    }

    expect(isNative()).toBe(false)
  })

  it("should read Capacitor from window", () => {
    globalThis.window = {
      Capacitor: {
        isNative: true,
      },
    }

    expect(isNative()).toBe(true)
  })
})

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

  it("is localStorage in a browser", () => {
    globalThis.localStorage = { getItem: () => null, setItem: () => {} }

    expect(createNativeStorage({ plugin: preferences() })).toBe(
      globalThis.localStorage,
    )
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
