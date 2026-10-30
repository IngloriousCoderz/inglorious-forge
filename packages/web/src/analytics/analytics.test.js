import { createStore } from "@inglorious/store"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createAnalytics } from "./index.js"

const CONSENT_KEY = "test-analytics-consent"

let stored
let adapter

beforeEach(() => {
  stored = new Map()
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
  })
  adapter = {
    setConsent: vi.fn(),
    pageView: vi.fn(),
    event: vi.fn(),
  }
})

function storeWithAnalytics(router = { route: "home", path: "/" }) {
  return createStore({
    types: {
      Analytics: createAnalytics({ adapter, consentKey: CONSENT_KEY }),
      Router: {},
    },
    entities: {
      analytics: { type: "Analytics" },
      router: { type: "Router", ...router },
    },
  })
}

const analytics = (store) => store.getState().analytics

describe("before an answer", () => {
  it("asks, and tells the adapter nothing", () => {
    const store = storeWithAnalytics()
    store.notify("routeChange", { route: "about", path: "/about" })
    store.notify("#analytics:analyticsTrack", { name: "sign_up" })

    expect(analytics(store).consent).toBeNull()
    expect(analytics(store).isAsking).toBe(true)
    expect(adapter.setConsent).not.toHaveBeenCalled()
    expect(adapter.pageView).not.toHaveBeenCalled()
    expect(adapter.event).not.toHaveBeenCalled()
  })
})

describe("analyticsConsent", () => {
  it("granted, starts measuring from the page the answer came from", () => {
    const store = storeWithAnalytics({ route: "events", path: "/events" })
    store.notify("#analytics:analyticsConsent", true)

    expect(analytics(store).consent).toBe("granted")
    expect(analytics(store).isAsking).toBe(false)
    expect(stored.get(CONSENT_KEY)).toBe("granted")
    expect(adapter.setConsent).toHaveBeenCalledWith(true)
    expect(adapter.pageView).toHaveBeenCalledWith({
      route: "events",
      path: "/events",
    })

    store.notify("routeChange", { route: "about", path: "/about" })
    store.notify("#analytics:analyticsTrack", {
      name: "sign_up",
      params: { method: "email" },
    })
    expect(adapter.pageView).toHaveBeenLastCalledWith({
      route: "about",
      path: "/about",
    })
    expect(adapter.event).toHaveBeenCalledWith("sign_up", { method: "email" })
  })

  it("denied, measures nothing and remembers it", () => {
    const store = storeWithAnalytics()
    store.notify("#analytics:analyticsConsent", false)
    store.notify("routeChange", { route: "about", path: "/about" })

    expect(stored.get(CONSENT_KEY)).toBe("denied")
    expect(adapter.setConsent).toHaveBeenCalledWith(false)
    expect(adapter.pageView).not.toHaveBeenCalled()
  })
})

describe("a choice made on an earlier visit", () => {
  it("granted, measures from the start without asking", () => {
    stored.set(CONSENT_KEY, "granted")
    const store = storeWithAnalytics()

    expect(analytics(store).isAsking).toBe(false)
    expect(adapter.setConsent).toHaveBeenCalledWith(true)
  })

  it("denied, stays quiet without asking", () => {
    stored.set(CONSENT_KEY, "denied")
    const store = storeWithAnalytics()

    expect(analytics(store).isAsking).toBe(false)
    expect(adapter.setConsent).not.toHaveBeenCalled()
  })
})

describe("analyticsAsk", () => {
  it("brings the prompt back, to change the choice", () => {
    stored.set(CONSENT_KEY, "granted")
    const store = storeWithAnalytics()
    store.notify("#analytics:analyticsAsk")
    expect(analytics(store).isAsking).toBe(true)
  })
})

describe("a failing adapter", () => {
  it("never reaches the app", async () => {
    stored.set(CONSENT_KEY, "granted")
    adapter.pageView = vi.fn(() => {
      throw new Error("blocked")
    })
    adapter.event = vi.fn(async () => {
      throw new Error("offline")
    })
    const store = storeWithAnalytics()

    expect(() => {
      store.notify("routeChange", { route: "about", path: "/about" })
      store.notify("#analytics:analyticsTrack", { name: "sign_up" })
    }).not.toThrow()
    await new Promise((resolve) => setTimeout(resolve))
  })
})
