import { beforeEach, describe, expect, it, vi } from "vitest"

const platform = vi.hoisted(() => ({ name: "android" }))
vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: () => platform.name },
}))
vi.mock("firebase/app", () => ({ getApps: () => [], initializeApp: vi.fn() }))
vi.mock("@capacitor-firebase/analytics", () => ({
  ConsentStatus: { Granted: "GRANTED", Denied: "DENIED" },
  ConsentType: {
    AnalyticsStorage: "ANALYTICS_STORAGE",
    AdStorage: "AD_STORAGE",
    AdUserData: "AD_USER_DATA",
    AdPersonalization: "AD_PERSONALIZATION",
  },
  FirebaseAnalytics: {
    setConsent: vi.fn(async () => {}),
    setEnabled: vi.fn(async () => {}),
    setCurrentScreen: vi.fn(async () => {}),
    logEvent: vi.fn(async () => {}),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

async function load(name) {
  platform.name = name
  vi.resetModules()
  const { firebaseAnalytics } = await import("./index.js")
  const { FirebaseAnalytics: plugin } =
    await import("@capacitor-firebase/analytics")
  return { analytics: firebaseAnalytics({ firebase: {} }), plugin }
}

describe("firebaseAnalytics", () => {
  it("grants usage measuring, never advertising", async () => {
    const { analytics, plugin } = await load("android")
    await analytics.setConsent(true)

    expect(plugin.setConsent).toHaveBeenCalledWith({
      type: "ANALYTICS_STORAGE",
      status: "GRANTED",
    })
    for (const type of ["AD_STORAGE", "AD_USER_DATA", "AD_PERSONALIZATION"]) {
      expect(plugin.setConsent).toHaveBeenCalledWith({
        type,
        status: "DENIED",
      })
    }
    expect(plugin.setEnabled).toHaveBeenCalledWith({ enabled: true })
  })

  it("loads nothing for a refusal before anything started", async () => {
    const { analytics, plugin } = await load("web")
    await analytics.setConsent(false)
    expect(plugin.setConsent).not.toHaveBeenCalled()
    expect(plugin.setEnabled).not.toHaveBeenCalled()
  })

  it("stops what it started, when the choice changes", async () => {
    const { analytics, plugin } = await load("web")
    await analytics.setConsent(true)
    await analytics.setConsent(false)
    expect(plugin.setEnabled).toHaveBeenLastCalledWith({ enabled: false })
  })

  it("logs screens in the native apps, named after the route", async () => {
    const { analytics, plugin } = await load("ios")
    await analytics.pageView({ route: "eventList", path: "/events" })
    expect(plugin.setCurrentScreen).toHaveBeenCalledWith({
      screenName: "eventList",
    })
  })

  it("leaves a browser's page views to the web SDK", async () => {
    const { analytics, plugin } = await load("web")
    await analytics.pageView({ route: "eventList", path: "/events" })
    expect(plugin.setCurrentScreen).not.toHaveBeenCalled()
  })

  it("logs the app's own events", async () => {
    const { analytics, plugin } = await load("android")
    await analytics.event("sign_up", { method: "email" })
    expect(plugin.logEvent).toHaveBeenCalledWith({
      name: "sign_up",
      params: { method: "email" },
    })
  })
})
