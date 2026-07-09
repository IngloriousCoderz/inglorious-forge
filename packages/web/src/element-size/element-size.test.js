/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ElementSize } from "."

describe("element size", () => {
  let api
  let entity
  let observerInstance

  beforeEach(() => {
    entity = {
      id: "viewport",
      type: "ElementSize",
    }

    api = {
      notify: vi.fn(),
    }

    observerInstance = null

    globalThis.ResizeObserver = vi.fn(function (callback) {
      this.callback = callback
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      observerInstance = this
    })
  })

  afterEach(() => {
    // Clears the module-level observer registry between tests.
    ElementSize.destroy(entity)
  })

  describe("create()", () => {
    it("should default to observing document.documentElement", () => {
      ElementSize.create(entity, undefined, api)

      expect(entity.isSupported).toBe(true)
      expect(entity.isWatching).toBe(true)
      expect(observerInstance.observe).toHaveBeenCalledWith(
        document.documentElement,
      )
    })

    it("should observe the element matching a given selector", () => {
      const sidebar = document.createElement("div")
      sidebar.id = "sidebar"
      document.body.appendChild(sidebar)

      entity.selector = "#sidebar"
      ElementSize.create(entity, undefined, api)

      expect(observerInstance.observe).toHaveBeenCalledWith(sidebar)
    })

    it("should fall back to document.documentElement when the selector matches nothing", () => {
      entity.selector = "#missing"
      ElementSize.create(entity, undefined, api)

      expect(entity.isWatching).toBe(true)
      expect(observerInstance.observe).toHaveBeenCalledWith(
        document.documentElement,
      )
    })

    it("should notify size changes through the observer callback", () => {
      ElementSize.create(entity, undefined, api)

      observerInstance.callback([{ contentRect: { width: 800, height: 600 } }])

      expect(api.notify).toHaveBeenCalledWith("#viewport:elementSizeChange", {
        width: 800,
        height: 600,
      })
    })

    it("should not observe when the environment is unsupported", () => {
      delete globalThis.ResizeObserver
      ElementSize.create(entity, undefined, api)

      expect(entity.isSupported).toBe(false)
      expect(entity.isWatching).toBe(false)
    })
  })

  describe("elementSizeChange()", () => {
    it("should store the latest dimensions", () => {
      ElementSize.elementSizeChange(entity, { width: 1024, height: 768 })

      expect(entity.width).toBe(1024)
      expect(entity.height).toBe(768)
    })
  })

  describe("destroy()", () => {
    it("should disconnect the observer", () => {
      ElementSize.create(entity, undefined, api)
      const instance = observerInstance

      ElementSize.destroy(entity)

      expect(instance.disconnect).toHaveBeenCalled()
      expect(entity.isWatching).toBe(false)
    })
  })

  describe("elementSizeUnwatch()", () => {
    it("should allow re-watching after unwatch", () => {
      ElementSize.create(entity, undefined, api)
      ElementSize.elementSizeUnwatch(entity)
      expect(entity.isWatching).toBe(false)

      ElementSize.create(entity, undefined, api)
      expect(entity.isWatching).toBe(true)
    })
  })
})
