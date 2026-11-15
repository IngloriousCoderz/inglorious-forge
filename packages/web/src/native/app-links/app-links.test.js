import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createAppLinks } from "./index.js"

describe("createAppLinks", () => {
  let app
  let urlOpen
  let remove
  let navigate

  beforeEach(() => {
    remove = vi.fn()
    app = {
      getLaunchUrl: vi.fn(async () => undefined),
      addListener: vi.fn(async (event, listener) => {
        urlOpen = listener
        return { remove }
      }),
    }
    navigate = vi.fn()
    vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function storeWith(config = {}) {
    return createStore({
      types: {
        AppLinks: createAppLinks({ plugin: app, ...config }),
        Router: { navigate: (entity, path) => navigate(path) },
      },
      entities: {
        appLinks: { type: "AppLinks" },
        router: { type: "Router" },
        nav: { type: "Router" },
      },
    })
  }

  it("routes a link that arrives while the app runs", async () => {
    const store = storeWith()
    await settle()

    urlOpen({ url: "https://app.example.com/jobs/42?tab=info#top" })

    expect(app.addListener).toHaveBeenCalledWith(
      "appUrlOpen",
      expect.any(Function),
    )
    expect(navigate).toHaveBeenCalledWith("/jobs/42?tab=info#top")
    expect(store.getEntity("appLinks").url).toBe(
      "https://app.example.com/jobs/42?tab=info#top",
    )
  })

  it("routes the link that started the app", async () => {
    app.getLaunchUrl.mockResolvedValueOnce({
      url: "https://app.example.com/profile",
    })

    storeWith()
    await settle()

    expect(navigate).toHaveBeenCalledWith("/profile")
  })

  it("notifies the router it is given", async () => {
    const store = storeWith({ router: "nav" })
    await settle()
    const spy = vi.spyOn(store, "dispatch")

    urlOpen({ url: "https://app.example.com/about" })

    expect(spy).toHaveBeenCalledWith({
      type: "#nav:navigate",
      payload: "/about",
    })
  })

  it("ignores what is not a URL", async () => {
    app.getLaunchUrl.mockRejectedValueOnce(new Error("unavailable"))

    storeWith()
    await settle()
    urlOpen({ url: "not a url" })

    expect(navigate).not.toHaveBeenCalled()
  })

  it("does nothing outside a native app", async () => {
    vi.stubGlobal("Capacitor", undefined)

    storeWith()
    await settle()

    expect(app.getLaunchUrl).not.toHaveBeenCalled()
    expect(app.addListener).not.toHaveBeenCalled()
  })

  it("stops listening when the entity goes", async () => {
    const store = storeWith()
    await settle()

    store.notify("remove", "appLinks")
    await settle()

    expect(remove).toHaveBeenCalled()
  })
})

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}
