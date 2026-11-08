import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { watchAppLinks } from "./index.js"

describe("watchAppLinks", () => {
  let app
  let store
  let urlOpen
  let remove

  beforeEach(() => {
    remove = vi.fn()
    app = {
      getLaunchUrl: vi.fn(async () => undefined),
      addListener: vi.fn(async (event, listener) => {
        urlOpen = listener
        return { remove }
      }),
    }
    store = { notify: vi.fn() }
    vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("routes a link that arrives while the app runs", async () => {
    watchAppLinks(app, store)
    await settle()

    urlOpen({ url: "https://app.example.com/jobs/42?tab=info#top" })

    expect(app.addListener).toHaveBeenCalledWith(
      "appUrlOpen",
      expect.any(Function),
    )
    expect(store.notify).toHaveBeenCalledWith(
      "#router:navigate",
      "/jobs/42?tab=info#top",
    )
  })

  it("routes the link that started the app", async () => {
    app.getLaunchUrl.mockResolvedValueOnce({
      url: "https://app.example.com/profile",
    })

    watchAppLinks(app, store)
    await settle()

    expect(store.notify).toHaveBeenCalledWith("#router:navigate", "/profile")
  })

  it("notifies the router it is given", async () => {
    watchAppLinks(app, store, { id: "nav" })
    await settle()

    urlOpen({ url: "https://app.example.com/about" })

    expect(store.notify).toHaveBeenCalledWith("#nav:navigate", "/about")
  })

  it("ignores what is not a URL", async () => {
    app.getLaunchUrl.mockRejectedValueOnce(new Error("unavailable"))

    watchAppLinks(app, store)
    await settle()
    urlOpen({ url: "not a url" })

    expect(store.notify).not.toHaveBeenCalled()
  })

  it("does nothing outside a native app", async () => {
    vi.stubGlobal("Capacitor", undefined)

    watchAppLinks(app, store)
    await settle()

    expect(app.getLaunchUrl).not.toHaveBeenCalled()
    expect(app.addListener).not.toHaveBeenCalled()
  })

  it("stops listening", async () => {
    const stop = watchAppLinks(app, store)
    await settle()

    await stop()

    expect(remove).toHaveBeenCalled()
  })
})

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}
