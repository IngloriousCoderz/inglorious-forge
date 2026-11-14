/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createGeolocation } from "."

const POSITION = {
  coords: {
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 45.4642,
    longitude: 9.19,
    speed: null,
  },
  timestamp: 123,
}

describe("createGeolocation", () => {
  let api
  let entity
  let browser

  beforeEach(() => {
    api = { notify: vi.fn() }
    entity = { id: "geolocation", type: "Geolocation" }
    browser = {
      getCurrentPosition: vi.fn((onSuccess) => onSuccess(POSITION)),
      watchPosition: vi.fn(() => 7),
      clearWatch: vi.fn(),
    }
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: browser,
    })
  })

  afterEach(() => {
    createGeolocation().geolocationUnwatch({ id: "geolocation" })
    delete globalThis.Capacitor
  })

  it("starts empty", () => {
    const Geolocation = createGeolocation()
    Geolocation.create(entity)

    expect(entity).toMatchObject({
      error: null,
      isLoading: false,
      isSupported: true,
      isWatching: false,
      position: null,
    })
  })

  it("reads the position once, answering to the entity", () => {
    const Geolocation = createGeolocation()
    Geolocation.geolocationRequest(entity, { timeout: 1000 }, api)

    expect(entity.isLoading).toBe(true)
    expect(browser.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { timeout: 1000 },
    )
    expect(api.notify).toHaveBeenCalledWith(
      "#geolocation:geolocationSuccess",
      POSITION,
    )
  })

  it("keeps the position it is told", () => {
    const Geolocation = createGeolocation()
    entity.isLoading = true
    Geolocation.geolocationSuccess(entity, POSITION)

    expect(entity).toMatchObject({ isLoading: false, position: POSITION })
  })

  it("keeps an error as data", () => {
    const Geolocation = createGeolocation()
    Geolocation.geolocationError(entity, { code: 1, message: "Denied" })

    expect(entity.error).toEqual({ code: 1, message: "Denied" })
  })

  it("says when there is no geolocation", () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    })
    const Geolocation = createGeolocation()
    Geolocation.geolocationRequest(entity, {}, api)

    expect(entity.isSupported).toBe(false)
    expect(api.notify).toHaveBeenCalledWith(
      "#geolocation:geolocationError",
      expect.objectContaining({ code: 0 }),
    )
  })

  it("watches once, and stops", () => {
    const Geolocation = createGeolocation()
    Geolocation.geolocationWatch(entity, {}, api)
    Geolocation.geolocationWatch(entity, {}, api)

    expect(browser.watchPosition).toHaveBeenCalledTimes(1)
    expect(entity.isWatching).toBe(true)
    expect(Object.values(entity).includes(7)).toBe(false)

    Geolocation.geolocationUnwatch(entity)

    expect(browser.clearWatch).toHaveBeenCalledWith(7)
    expect(entity.isWatching).toBe(false)
  })

  describe("in a native app", () => {
    let plugin

    beforeEach(() => {
      globalThis.Capacitor = { isNativePlatform: () => true }
      plugin = {
        getCurrentPosition: vi.fn(async () => POSITION),
        watchPosition: vi.fn(async (options, callback) => {
          callback(POSITION)
          return "watch-1"
        }),
        clearWatch: vi.fn(async () => {}),
      }
    })

    it("reads the position through the plugin", async () => {
      const Geolocation = createGeolocation({ plugin })
      Geolocation.geolocationRequest(entity, {}, api)

      await vi.waitFor(() =>
        expect(api.notify).toHaveBeenCalledWith(
          "#geolocation:geolocationSuccess",
          POSITION,
        ),
      )
      expect(browser.getCurrentPosition).not.toHaveBeenCalled()
    })

    it("watches through the plugin, and clears its watch", async () => {
      const Geolocation = createGeolocation({ plugin })
      Geolocation.geolocationWatch(entity, {}, api)
      Geolocation.geolocationUnwatch(entity)

      await vi.waitFor(() =>
        expect(plugin.clearWatch).toHaveBeenCalledWith({ id: "watch-1" }),
      )
      expect(api.notify).toHaveBeenCalledWith(
        "#geolocation:geolocationSuccess",
        POSITION,
      )
    })
  })
})
