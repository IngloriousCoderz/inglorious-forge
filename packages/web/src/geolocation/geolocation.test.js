/**
 * @vitest-environment jsdom
 */
import { createStore } from "@inglorious/store"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Geolocation } from "."

describe("geolocation", () => {
  let api
  let entity
  let geolocation
  let position

  beforeEach(() => {
    entity = {
      id: "geolocation",
      type: "Geolocation",
    }

    api = {
      notify: vi.fn(),
    }

    position = {
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

    geolocation = {
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn().mockReturnValue(7),
    }

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: geolocation,
    })
  })

  describe("create()", () => {
    it("should initialize the entity state", () => {
      Geolocation.create(entity)

      expect(entity).toEqual({
        id: "geolocation",
        type: "Geolocation",
        error: null,
        isLoading: false,
        isSupported: true,
        isWatching: false,
        position: null,
        watchId: null,
      })
    })
  })

  describe("request()", () => {
    it("should request the current position", () => {
      Geolocation.create(entity)
      Geolocation.request(entity, { enableHighAccuracy: true }, api)

      expect(entity.isLoading).toBe(true)
      expect(geolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        { enableHighAccuracy: true },
      )
    })

    it("should notify success with a normalized position", () => {
      Geolocation.create(entity)
      Geolocation.request(entity, {}, api)

      const [onSuccess] = geolocation.getCurrentPosition.mock.calls[0]
      onSuccess(position)

      expect(api.notify).toHaveBeenCalledWith("#geolocation:success", position)
    })
  })

  describe("success()", () => {
    it("should store the current position", () => {
      entity.isLoading = true
      entity.error = { code: 1, message: "Denied" }

      Geolocation.success(entity, position)

      expect(entity.error).toBe(null)
      expect(entity.isLoading).toBe(false)
      expect(entity.position).toEqual(position)
    })
  })

  describe("error()", () => {
    it("should store a normalized error", () => {
      entity.isLoading = true

      Geolocation.error(entity, { code: 1, message: "Denied" })

      expect(entity.error).toEqual({ code: 1, message: "Denied" })
      expect(entity.isLoading).toBe(false)
    })
  })

  describe("watch()", () => {
    it("should start watching positions", () => {
      Geolocation.create(entity)
      Geolocation.watch(entity, { timeout: 1000 }, api)

      expect(entity.isLoading).toBe(true)
      expect(entity.isWatching).toBe(true)
      expect(entity.watchId).toBe(7)
      expect(geolocation.watchPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        { timeout: 1000 },
      )
    })

    it("should not start a second watch while already watching", () => {
      entity.watchId = 7

      Geolocation.watch(entity, {}, api)

      expect(geolocation.watchPosition).not.toHaveBeenCalled()
    })
  })

  describe("unwatch()", () => {
    it("should clear the active watch", () => {
      entity.isLoading = true
      entity.isWatching = true
      entity.watchId = 7

      Geolocation.unwatch(entity)

      expect(geolocation.clearWatch).toHaveBeenCalledWith(7)
      expect(entity.isLoading).toBe(false)
      expect(entity.isWatching).toBe(false)
      expect(entity.watchId).toBe(null)
    })
  })

  describe("unsupported environments", () => {
    it("should notify an error when geolocation is unsupported", () => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: undefined,
      })

      Geolocation.create(entity)
      Geolocation.request(entity, {}, api)

      expect(entity.isSupported).toBe(false)
      expect(api.notify).toHaveBeenCalledWith("#geolocation:error", {
        code: 0,
        message: "Geolocation is not supported by this environment.",
      })
    })
  })

  describe("store integration", () => {
    it("should create a geolocation entity when autoCreateEntities is enabled", () => {
      const store = createStore({
        types: { Geolocation },
        autoCreateEntities: true,
      })

      expect(store.getState().geolocation).toEqual({
        id: "geolocation",
        type: "Geolocation",
        error: null,
        isLoading: false,
        isSupported: true,
        isWatching: false,
        position: null,
        watchId: null,
      })
    })
  })
})
