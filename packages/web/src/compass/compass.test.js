/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Compass } from "."

describe("compass", () => {
  let api
  let entity
  let windowMock

  beforeEach(() => {
    entity = { id: "compass", type: "Compass" }

    api = { notify: vi.fn() }

    windowMock = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      screen: { orientation: { angle: 0 } },
    }

    globalThis.window = windowMock
    globalThis.DeviceOrientationEvent = function () {}
    globalThis.DeviceOrientationEvent.requestPermission = undefined

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------

  describe("create", () => {
    it("should initialize entity state", () => {
      Compass.create(entity)

      expect(entity).toEqual({
        id: "compass",
        type: "Compass",
        error: null,
        heading: null,
        isActive: false,
        isPermissionGranted: false,
        isLoading: false,
        isSupported: true,
        manualOffset: 0,
        _absoluteListener: null,
        _orientationListener: null,
        _isUsingAbsolute: false,
        compassTimeout: null,
      })
    })

    it("should mark isSupported false when DeviceOrientationEvent is absent", () => {
      delete globalThis.DeviceOrientationEvent

      Compass.create(entity)

      expect(entity.isSupported).toBe(false)
    })

    it("should not overwrite existing values", () => {
      entity.heading = 90
      entity.manualOffset = 15

      Compass.create(entity)

      expect(entity.heading).toBe(90)
      expect(entity.manualOffset).toBe(15)
    })
  })

  // ---------------------------------------------------------------------------
  // compassPermissionsRequest
  // ---------------------------------------------------------------------------

  describe("compassPermissionsRequest", () => {
    beforeEach(() => Compass.create(entity))

    it("should notify compassPermissionsGrant when no requestPermission API exists", async () => {
      await Compass.compassPermissionsRequest(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("compassPermissionsGrant")
    })

    it("should notify compassError when compass is not supported", async () => {
      delete globalThis.DeviceOrientationEvent

      await Compass.compassPermissionsRequest(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("compassError", {
        code: 0,
        message: "Compass is not supported by this environment.",
      })
      expect(entity.isLoading).toBe(false)
    })

    it("should notify compassPermissionsGrant when requestPermission resolves granted", async () => {
      globalThis.DeviceOrientationEvent.requestPermission = vi
        .fn()
        .mockResolvedValue("granted")

      await Compass.compassPermissionsRequest(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("compassPermissionsGrant")
    })

    it("should notify compassError when requestPermission resolves denied", async () => {
      globalThis.DeviceOrientationEvent.requestPermission = vi
        .fn()
        .mockResolvedValue("denied")

      await Compass.compassPermissionsRequest(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("compassError", {
        code: 1,
        message: "Compass permission denied.",
      })
      expect(entity.isLoading).toBe(false)
    })

    it("should notify compassError when requestPermission throws", async () => {
      globalThis.DeviceOrientationEvent.requestPermission = vi
        .fn()
        .mockRejectedValue({ code: 99, message: "Something went wrong" })

      await Compass.compassPermissionsRequest(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("compassError", {
        code: 99,
        message: "Something went wrong",
      })
      expect(entity.isLoading).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // compassPermissionsGrant
  // ---------------------------------------------------------------------------

  describe("compassPermissionsGrant", () => {
    beforeEach(() => Compass.create(entity))

    it("should set isPermissionGranted and clear isLoading", () => {
      entity.isLoading = true

      Compass.compassPermissionsGrant(entity)

      expect(entity.isPermissionGranted).toBe(true)
      expect(entity.isLoading).toBe(false)
    })

    it("should not start listeners — that is compassWatch's responsibility", () => {
      Compass.compassPermissionsGrant(entity)

      expect(windowMock.addEventListener).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // compassWatch
  // ---------------------------------------------------------------------------

  describe("compassWatch", () => {
    beforeEach(() => Compass.create(entity))

    it("should register deviceorientation and deviceorientationabsolute listeners", () => {
      Compass.compassWatch(entity, undefined, api)

      expect(windowMock.addEventListener).toHaveBeenCalledWith(
        "deviceorientationabsolute",
        expect.any(Function),
      )
      expect(windowMock.addEventListener).toHaveBeenCalledWith(
        "deviceorientation",
        expect.any(Function),
      )
    })

    it("should store listeners on the entity", () => {
      Compass.compassWatch(entity, undefined, api)

      expect(entity._orientationListener).toBeTypeOf("function")
      expect(entity._absoluteListener).toBeTypeOf("function")
    })

    it("should notify compassActiveChange false after timeout when no heading arrived", () => {
      Compass.compassWatch(entity, undefined, api)

      vi.runAllTimers()

      expect(api.notify).toHaveBeenCalledWith("compassActiveChange", false)
    })

    it("should not notify compassActiveChange false after timeout when heading already arrived", () => {
      Compass.compassWatch(entity, undefined, api)
      entity.heading = 45

      vi.runAllTimers()

      expect(api.notify).not.toHaveBeenCalledWith("compassActiveChange", false)
    })
  })

  // ---------------------------------------------------------------------------
  // orientation listener (via compassWatch)
  // ---------------------------------------------------------------------------

  describe("orientation listener", () => {
    beforeEach(() => {
      Compass.create(entity)
      Compass.compassWatch(entity, undefined, api)
    })

    it("should notify compassHeadingChange with the adjusted heading", () => {
      const [[, listener]] = windowMock.addEventListener.mock.calls.filter(
        ([name]) => name === "deviceorientation",
      )

      listener({ alpha: 90 })

      expect(api.notify).toHaveBeenCalledWith("compassHeadingChange", 90)
    })

    it("should notify compassActiveChange true when a valid heading arrives", () => {
      const [[, listener]] = windowMock.addEventListener.mock.calls.filter(
        ([name]) => name === "deviceorientation",
      )

      listener({ alpha: 45 })

      expect(api.notify).toHaveBeenCalledWith("compassActiveChange", true)
    })

    it("should ignore events where alpha is not a number", () => {
      const [[, listener]] = windowMock.addEventListener.mock.calls.filter(
        ([name]) => name === "deviceorientation",
      )

      listener({ alpha: null })

      expect(api.notify).not.toHaveBeenCalled()
    })

    it("should apply manualOffset to the heading", () => {
      entity.manualOffset = 10

      const [[, listener]] = windowMock.addEventListener.mock.calls.filter(
        ([name]) => name === "deviceorientation",
      )

      listener({ alpha: 80 })

      expect(api.notify).toHaveBeenCalledWith("compassHeadingChange", 90)
    })

    it("should clear the timeout when a heading arrives", () => {
      const [[, listener]] = windowMock.addEventListener.mock.calls.filter(
        ([name]) => name === "deviceorientation",
      )

      listener({ alpha: 30 })

      expect(entity.compassTimeout).toBeNull()
    })

    it("should upgrade to absolute listener and drop orientation listener", () => {
      const [[, absoluteListener]] =
        windowMock.addEventListener.mock.calls.filter(
          ([name]) => name === "deviceorientationabsolute",
        )

      absoluteListener({ alpha: 120 })

      expect(entity._isUsingAbsolute).toBe(true)
      expect(windowMock.removeEventListener).toHaveBeenCalledWith(
        "deviceorientation",
        entity._orientationListener,
      )
    })

    it("should wrap heading correctly past 360 degrees", () => {
      windowMock.screen.orientation.angle = 90

      const [[, listener]] = windowMock.addEventListener.mock.calls.filter(
        ([name]) => name === "deviceorientation",
      )

      listener({ alpha: 30 }) // 30 - 90 = -60 → wraps to 300

      expect(api.notify).toHaveBeenCalledWith("compassHeadingChange", 300)
    })
  })

  // ---------------------------------------------------------------------------
  // compassUnwatch
  // ---------------------------------------------------------------------------

  describe("compassUnwatch", () => {
    beforeEach(() => {
      Compass.create(entity)
      Compass.compassWatch(entity, undefined, api)
    })

    it("should remove both event listeners", () => {
      const { _orientationListener, _absoluteListener } = entity

      Compass.compassUnwatch(entity)

      expect(windowMock.removeEventListener).toHaveBeenCalledWith(
        "deviceorientation",
        _orientationListener,
      )
      expect(windowMock.removeEventListener).toHaveBeenCalledWith(
        "deviceorientationabsolute",
        _absoluteListener,
      )
    })

    it("should reset entity state", () => {
      Compass.compassUnwatch(entity)

      expect(entity.isLoading).toBe(false)
      expect(entity.isActive).toBe(false)
      expect(entity.compassTimeout).toBeNull()
      expect(entity._orientationListener).toBeNull()
      expect(entity._absoluteListener).toBeNull()
      expect(entity._isUsingAbsolute).toBe(false)
    })

    it("should cancel a pending timeout", () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout")

      const timeoutId = entity.compassTimeout
      Compass.compassUnwatch(entity)

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
    })
  })

  // ---------------------------------------------------------------------------
  // compassError
  // ---------------------------------------------------------------------------

  describe("compassError", () => {
    beforeEach(() => Compass.create(entity))

    it("should store normalized error and clear isLoading", () => {
      Compass.compassError(entity, { code: 2, message: "Some error" })

      expect(entity.error).toEqual({ code: 2, message: "Some error" })
      expect(entity.isLoading).toBe(false)
    })

    it("should revoke permission on error", () => {
      entity.isPermissionGranted = true

      Compass.compassError(entity, { code: 1, message: "Denied" })

      expect(entity.isPermissionGranted).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // compassActiveChange / compassHeadingChange
  // ---------------------------------------------------------------------------

  describe("compassActiveChange", () => {
    it("should set isActive", () => {
      Compass.compassActiveChange(entity, true)
      expect(entity.isActive).toBe(true)

      Compass.compassActiveChange(entity, false)
      expect(entity.isActive).toBe(false)
    })
  })

  describe("compassHeadingChange", () => {
    it("should update heading and clear isLoading", () => {
      entity.isLoading = true

      Compass.compassHeadingChange(entity, 180)

      expect(entity.heading).toBe(180)
      expect(entity.isLoading).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // destroy
  // ---------------------------------------------------------------------------

  describe("destroy", () => {
    it("should call compassUnwatch", () => {
      Compass.create(entity)
      Compass.compassWatch(entity, undefined, api)

      Compass.destroy(entity)

      expect(entity._orientationListener).toBeNull()
      expect(entity._absoluteListener).toBeNull()
    })
  })
})
