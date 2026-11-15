import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createLiveUpdate, isLiveUpdateWanted } from "./index.js"

const MANIFEST_URL = "https://cdn.test/live-update/manifest.json"
const MANIFEST = {
  release: 200,
  minBuild: 5,
  url: "https://cdn.test/live-update/bundles/200.zip",
  checksum: "abc",
  signature: "c2ln",
}

let plugin
let app
let listeners

beforeEach(() => {
  listeners = {}
  plugin = {
    ready: vi.fn(async () => ({})),
    reload: vi.fn(async () => {}),
    getBlockedBundles: vi.fn(async () => ({ bundleIds: [] })),
    getDownloadedBundles: vi.fn(async () => ({ bundleIds: [] })),
    downloadBundle: vi.fn(async () => {}),
    setNextBundle: vi.fn(async () => {}),
  }
  app = {
    getInfo: vi.fn(async () => ({ build: "7" })),
    addListener: vi.fn(async (event, listener) => {
      listeners[event] = listener
      return { remove: vi.fn(async () => {}) }
    }),
  }
  vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
  serve(MANIFEST)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function serve(manifest, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok,
      status: ok ? 200 : 404,
      json: async () => manifest,
    })),
  )
}

function storeWith(release = 100, config = {}) {
  return createStore({
    types: {
      LiveUpdate: createLiveUpdate({
        plugin,
        app,
        manifestUrl: MANIFEST_URL,
        release,
        ...config,
      }),
    },
    entities: { liveUpdate: { type: "LiveUpdate" } },
  })
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}

const entityOf = (store) => store.getEntity("liveUpdate")

describe("isLiveUpdateWanted", () => {
  it("takes a newer release the installed build can run", () => {
    expect(isLiveUpdateWanted(MANIFEST, { release: 100, build: 5 })).toBe(true)
  })

  it("never goes back, nor past what the build can run", () => {
    expect(isLiveUpdateWanted(MANIFEST, { release: 200, build: 7 })).toBe(false)
    expect(isLiveUpdateWanted(MANIFEST, { release: 300, build: 7 })).toBe(false)
    expect(isLiveUpdateWanted(MANIFEST, { release: 100, build: 4 })).toBe(false)
    expect(isLiveUpdateWanted(null, { release: 100, build: 7 })).toBe(false)
  })
})

describe("createLiveUpdate", () => {
  it("confirms the running bundle, then downloads a wanted one", async () => {
    const store = storeWith()
    expect(entityOf(store)).toMatchObject({
      isUpdateReady: false,
      pendingRelease: null,
    })
    await settle()

    expect(plugin.ready).toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledWith(MANIFEST_URL, { cache: "no-store" })
    expect(plugin.downloadBundle).toHaveBeenCalledWith({
      url: MANIFEST.url,
      bundleId: "200",
      checksum: "abc",
      signature: "c2ln",
    })
    expect(plugin.setNextBundle).toHaveBeenCalledWith({ bundleId: "200" })
    expect(entityOf(store)).toMatchObject({
      isUpdateReady: true,
      pendingRelease: 200,
    })
  })

  it("applies the bundle when the app goes to the background", async () => {
    storeWith()
    await settle()
    listeners.pause()
    expect(plugin.reload).toHaveBeenCalled()
  })

  it("moves over at once on liveUpdateApply", async () => {
    const store = storeWith()
    await settle()
    store.notify("#liveUpdate:liveUpdateApply")
    expect(plugin.reload).toHaveBeenCalled()
  })

  it("reuses a bundle already downloaded, and announces it once", async () => {
    plugin.getDownloadedBundles.mockResolvedValue({ bundleIds: ["200"] })
    const store = storeWith()
    const seen = []
    store.subscribe(() => seen.push(entityOf(store).pendingRelease))
    await settle()
    listeners.resume()
    await settle()

    expect(plugin.downloadBundle).not.toHaveBeenCalled()
    expect(seen).toStrictEqual([200])
  })

  it("skips what is not wanted, rolled back, or unreachable", async () => {
    storeWith(200)
    await settle()
    expect(plugin.downloadBundle).not.toHaveBeenCalled()

    plugin.getBlockedBundles.mockResolvedValue({ bundleIds: ["200"] })
    storeWith()
    await settle()
    expect(plugin.downloadBundle).not.toHaveBeenCalled()

    serve(null, false)
    plugin.getBlockedBundles.mockResolvedValue({ bundleIds: [] })
    const store = storeWith()
    await settle()
    expect(plugin.downloadBundle).not.toHaveBeenCalled()
    expect(entityOf(store).isUpdateReady).toBe(false)
  })

  it("reloads nothing on pause while nothing is downloaded", async () => {
    plugin.downloadBundle.mockRejectedValue(new Error("Signature mismatch"))
    storeWith()
    await settle()
    listeners.pause()
    expect(plugin.reload).not.toHaveBeenCalled()
  })

  it("does nothing outside a native app, or without a release", async () => {
    vi.stubGlobal("Capacitor", undefined)
    storeWith()
    await settle()
    expect(plugin.ready).not.toHaveBeenCalled()

    vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
    storeWith(0)
    await settle()
    expect(plugin.ready).not.toHaveBeenCalled()
  })

  it("stops watching when the entity goes", async () => {
    const store = storeWith()
    await settle()
    const [, pause] = await Promise.all(
      app.addListener.mock.results.map((r) => r.value),
    )

    store.notify("remove", "liveUpdate")
    await settle()

    expect(pause.remove).toHaveBeenCalled()
  })
})
