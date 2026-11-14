import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createBiometrics } from "./index.js"

const FACE_ID = 2
const USER_CANCEL = 16
const LOCKOUT = 2

function storeWith(type) {
  return createStore({
    types: { Biometrics: type },
    entities: { biometrics: { type: "Biometrics" } },
  })
}

describe("createBiometrics", () => {
  let plugin

  beforeEach(() => {
    globalThis.Capacitor = { isNativePlatform: () => true }
    plugin = {
      isAvailable: vi.fn(async () => ({
        isAvailable: true,
        biometryType: FACE_ID,
      })),
      verifyIdentity: vi.fn(async () => {}),
    }
  })

  afterEach(() => {
    delete globalThis.Capacitor
  })

  it("says whether the device can verify, and how", async () => {
    const store = storeWith(createBiometrics({ plugin }))

    await vi.waitFor(() =>
      expect(store.getEntity("biometrics")).toMatchObject({
        isAvailable: true,
        biometryType: "face",
      }),
    )
  })

  it("verifies through the system's prompt", async () => {
    const store = storeWith(createBiometrics({ plugin }))
    store.notify("#biometrics:verify", { reason: "Unlock" })

    await vi.waitFor(() =>
      expect(store.getEntity("biometrics").result).toBe("verified"),
    )
    expect(plugin.verifyIdentity).toHaveBeenCalledWith({ reason: "Unlock" })
  })

  it("takes closing the prompt as no error", async () => {
    plugin.verifyIdentity.mockRejectedValue({ code: String(USER_CANCEL) })
    const store = storeWith(createBiometrics({ plugin }))
    store.notify("#biometrics:verify")

    await vi.waitFor(() =>
      expect(store.getEntity("biometrics")).toMatchObject({
        result: "cancelled",
        error: null,
      }),
    )
  })

  it("fails on anything else", async () => {
    plugin.verifyIdentity.mockRejectedValue({ code: LOCKOUT })
    const store = storeWith(createBiometrics({ plugin }))
    store.notify("#biometrics:verify")

    await vi.waitFor(() =>
      expect(store.getEntity("biometrics").error).toBe("failed"),
    )
  })

  it("is never available in a browser", async () => {
    delete globalThis.Capacitor
    const store = storeWith(createBiometrics({ plugin }))
    store.notify("#biometrics:verify")

    await vi.waitFor(() =>
      expect(store.getEntity("biometrics")).toMatchObject({
        isAvailable: false,
        error: "unavailable",
      }),
    )
    expect(plugin.isAvailable).not.toHaveBeenCalled()
  })
})
