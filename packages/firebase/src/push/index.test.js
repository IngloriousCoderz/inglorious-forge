import { beforeEach, describe, expect, it, vi } from "vitest"

const platform = vi.hoisted(() => ({ name: "android" }))
vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: () => platform.name },
}))
vi.mock("firebase/app", () => ({ getApps: () => [], initializeApp: vi.fn() }))
vi.mock("@capacitor-firebase/messaging", () => ({
  FirebaseMessaging: {
    isSupported: vi.fn(async () => ({ isSupported: true })),
    checkPermissions: vi.fn(async () => ({
      receive: "prompt-with-rationale",
    })),
    requestPermissions: vi.fn(async () => ({ receive: "granted" })),
    getToken: vi.fn(async () => ({ token: "token-1" })),
    addListener: vi.fn(),
  },
}))

import { FirebaseMessaging } from "@capacitor-firebase/messaging"

import { firebasePush } from "./index.js"

let stored

beforeEach(() => {
  vi.clearAllMocks()
  stored = new Map()
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
      removeItem: (key) => stored.delete(key),
    },
  })
})

function adapter() {
  return firebasePush({
    firebase: {},
    vapidKey: "vapid",
    saveToken: vi.fn(async () => {}),
    deleteToken: vi.fn(async () => {}),
    tokenKey: "test-token",
  })
}

describe("firebasePush on Android", () => {
  it("reads a rationale as not yet answered", async () => {
    expect(await adapter().permission()).toBe("prompt")
  })

  it("asks FCM for a token without browser options", async () => {
    await adapter().register()
    expect(FirebaseMessaging.getToken).toHaveBeenCalledWith({})
    expect(stored.get("test-token")).toBe("token-1")
  })

  it("unregisters the token it stored, and only that", async () => {
    const saveToken = vi.fn(async () => {})
    const deleteToken = vi.fn(async () => {})
    const push = firebasePush({
      firebase: {},
      vapidKey: "vapid",
      saveToken,
      deleteToken,
      tokenKey: "test-token",
    })

    await push.unregister()
    expect(deleteToken).not.toHaveBeenCalled()

    await push.register()
    expect(saveToken).toHaveBeenCalledWith("token-1", "android")
    await push.unregister()
    expect(deleteToken).toHaveBeenCalledWith("token-1")
    expect(stored.has("test-token")).toBe(false)
  })

  it("hears taps, with the push's URL", () => {
    const listener = vi.fn()
    adapter().onTap(listener)
    const [, onAction] = FirebaseMessaging.addListener.mock.calls[0]
    onAction({ notification: { data: { url: "/events/e1" } } })
    onAction({ notification: { data: {} } })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith("/events/e1")
  })
})

describe("firebasePush in a browser", () => {
  async function webAdapter() {
    platform.name = "web"
    vi.resetModules()
    const { firebasePush: webPush } = await import("./index.js")
    const { initializeApp } = await import("firebase/app")
    return {
      initializeApp,
      push: webPush({
        firebase: { projectId: "p" },
        vapidKey: "vapid",
        saveToken: vi.fn(async () => {}),
        deleteToken: vi.fn(async () => {}),
      }),
    }
  }

  it("asks with the browser's own dialog, before anything awaits", async () => {
    const requestPermission = vi.fn(async () => "default")
    vi.stubGlobal("Notification", { requestPermission })
    const { push } = await webAdapter()

    const answer = push.request()
    expect(requestPermission).toHaveBeenCalled()
    expect(await answer).toBe("prompt")
  })

  it("starts the web app, and registers on the PWA's service worker", async () => {
    const registration = { scope: "/" }
    vi.stubGlobal("navigator", {
      serviceWorker: { ready: Promise.resolve(registration) },
    })
    const { push, initializeApp } = await webAdapter()

    await push.register()
    expect(initializeApp).toHaveBeenCalledWith({ projectId: "p" })
    const { FirebaseMessaging: messaging } =
      await import("@capacitor-firebase/messaging")
    expect(messaging.getToken).toHaveBeenCalledWith({
      vapidKey: "vapid",
      serviceWorkerRegistration: registration,
    })
  })

  it("leaves taps to the service worker", async () => {
    const { push } = await webAdapter()
    push.onTap(vi.fn())
    const { FirebaseMessaging: messaging } =
      await import("@capacitor-firebase/messaging")
    expect(messaging.addListener).not.toHaveBeenCalled()
  })
})
