import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createNativeUpdate, watchNativeUpdate } from "./index.js"

const STORE_URL = "https://play.google.com/store/apps/details?id=app"

let adapter
let assign

beforeEach(() => {
  assign = vi.fn()
  vi.stubGlobal("window", { location: { assign } })
  adapter = {
    requirement: vi.fn(async () => ({ minBuild: 4, storeUrl: STORE_URL })),
  }
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function storeWith(type = createNativeUpdate({ adapter })) {
  return createStore({
    types: { NativeUpdate: type },
    entities: { nativeUpdate: { type: "NativeUpdate" } },
  })
}

async function check(store, build, platform = "android") {
  store.notify("#nativeUpdate:nativeUpdateCheck", { platform, build })
  await settle()
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}

const entityOf = (store) => store.getState().nativeUpdate

describe("createNativeUpdate", () => {
  it("starts with nothing required", () => {
    expect(entityOf(storeWith())).toMatchObject({
      isUpdateRequired: false,
      storeUrl: null,
    })
  })

  it("requires an update below the minimum build", async () => {
    const store = storeWith()
    await check(store, 3)

    expect(adapter.requirement).toHaveBeenCalledWith("android")
    expect(entityOf(store)).toMatchObject({
      isUpdateRequired: true,
      storeUrl: STORE_URL,
    })
  })

  it("lets the minimum itself and anything newer through", async () => {
    const store = storeWith()
    await check(store, 4)
    expect(entityOf(store).isUpdateRequired).toBe(false)

    await check(store, 5)
    expect(entityOf(store).isUpdateRequired).toBe(false)
  })

  it("lets through without a requirement or a readable build", async () => {
    const store = storeWith()
    adapter.requirement.mockResolvedValueOnce(null)
    await check(store, 3)
    expect(entityOf(store).isUpdateRequired).toBe(false)

    await check(store, Number.NaN)
    expect(entityOf(store).isUpdateRequired).toBe(false)
  })

  it("keeps the last answer when a check fails", async () => {
    const store = storeWith()
    await check(store, 3)

    adapter.requirement.mockRejectedValueOnce(new Error("offline"))
    await check(store, 3)

    expect(entityOf(store).isUpdateRequired).toBe(true)
  })

  it("opens the store on nativeUpdateApply", async () => {
    const store = storeWith()
    await check(store, 3)

    store.notify("#nativeUpdate:nativeUpdateApply")

    expect(assign).toHaveBeenCalledWith(STORE_URL)
  })

  it("opens nothing without a store link", async () => {
    adapter.requirement.mockResolvedValueOnce({ minBuild: 4, storeUrl: null })
    const store = storeWith()
    await check(store, 3)

    store.notify("#nativeUpdate:nativeUpdateApply")

    expect(assign).not.toHaveBeenCalled()
  })
})

describe("watchNativeUpdate", () => {
  let app
  let store
  let resume
  let remove

  beforeEach(() => {
    remove = vi.fn()
    app = {
      getInfo: vi.fn(async () => ({ build: "7" })),
      addListener: vi.fn(async (event, listener) => {
        resume = listener
        return { remove }
      }),
    }
    store = { notify: vi.fn() }
    vi.stubGlobal("Capacitor", {
      isNativePlatform: () => true,
      getPlatform: () => "ios",
    })
  })

  it("checks at launch and on every resume", async () => {
    watchNativeUpdate(app, store)
    await settle()

    expect(app.addListener).toHaveBeenCalledWith("resume", expect.any(Function))
    expect(store.notify).toHaveBeenCalledWith(
      "#nativeUpdate:nativeUpdateCheck",
      { platform: "ios", build: 7 },
    )

    resume()
    await settle()

    expect(store.notify).toHaveBeenCalledTimes(2)
  })

  it("notifies the entity it is given", async () => {
    watchNativeUpdate(app, store, { id: "gate" })
    await settle()

    expect(store.notify).toHaveBeenCalledWith(
      "#gate:nativeUpdateCheck",
      expect.anything(),
    )
  })

  it("does nothing outside a native app", async () => {
    vi.stubGlobal("Capacitor", undefined)

    watchNativeUpdate(app, store)
    await settle()

    expect(app.getInfo).not.toHaveBeenCalled()
    expect(store.notify).not.toHaveBeenCalled()
  })

  it("stays quiet when the build cannot be read", async () => {
    app.getInfo.mockRejectedValueOnce(new Error("unavailable"))

    watchNativeUpdate(app, store)
    await settle()

    expect(store.notify).not.toHaveBeenCalled()
  })

  it("stops listening", async () => {
    const stop = watchNativeUpdate(app, store)
    await settle()

    await stop()

    expect(remove).toHaveBeenCalled()
  })
})
