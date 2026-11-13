import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createLiveUpdate,
  isLiveUpdateWanted,
  watchLiveUpdate,
} from "./index.js"

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
let store

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
  store = { notify: vi.fn() }
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

function watch(release = 100) {
  return watchLiveUpdate({
    plugin,
    app,
    store,
    manifestUrl: MANIFEST_URL,
    release,
  })
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}

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

describe("watchLiveUpdate", () => {
  it("confirms the running bundle, then downloads a wanted one", async () => {
    watch()
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
    expect(store.notify).toHaveBeenCalledWith("#liveUpdate:liveUpdateReady")
  })

  it("applies the bundle when the app goes to the background", async () => {
    watch()
    await settle()
    listeners.pause()
    expect(plugin.reload).toHaveBeenCalled()
  })

  it("reuses a bundle already downloaded, and announces it once", async () => {
    plugin.getDownloadedBundles.mockResolvedValue({ bundleIds: ["200"] })
    watch()
    await settle()
    listeners.resume()
    await settle()

    expect(plugin.downloadBundle).not.toHaveBeenCalled()
    expect(store.notify).toHaveBeenCalledTimes(1)
  })

  it("skips what is not wanted, rolled back, or unreachable", async () => {
    watch(200)
    await settle()
    expect(plugin.downloadBundle).not.toHaveBeenCalled()

    plugin.getBlockedBundles.mockResolvedValue({ bundleIds: ["200"] })
    watch()
    await settle()
    expect(plugin.downloadBundle).not.toHaveBeenCalled()

    serve(null, false)
    plugin.getBlockedBundles.mockResolvedValue({ bundleIds: [] })
    watch()
    await settle()
    expect(plugin.downloadBundle).not.toHaveBeenCalled()
    expect(store.notify).not.toHaveBeenCalled()
  })

  it("reloads nothing on pause while nothing is downloaded", async () => {
    plugin.downloadBundle.mockRejectedValue(new Error("Signature mismatch"))
    watch()
    await settle()
    listeners.pause()
    expect(plugin.reload).not.toHaveBeenCalled()
  })

  it("does nothing outside a native app", async () => {
    vi.stubGlobal("Capacitor", undefined)
    const stop = watch()
    await settle()
    expect(plugin.ready).not.toHaveBeenCalled()
    await stop()
  })
})

describe("createLiveUpdate", () => {
  it("shows a ready bundle and moves over to it", () => {
    const live = createStore({
      types: { LiveUpdate: createLiveUpdate({ plugin }) },
      entities: { liveUpdate: { type: "LiveUpdate" } },
    })
    expect(live.getState().liveUpdate.isUpdateReady).toBe(false)

    live.notify("#liveUpdate:liveUpdateReady")
    expect(live.getState().liveUpdate.isUpdateReady).toBe(true)

    live.notify("#liveUpdate:liveUpdateApply")
    expect(plugin.reload).toHaveBeenCalled()
  })
})
