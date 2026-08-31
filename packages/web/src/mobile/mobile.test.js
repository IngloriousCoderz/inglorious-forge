import { afterEach, describe, expect, it } from "vitest"

import { isNative } from "."

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
