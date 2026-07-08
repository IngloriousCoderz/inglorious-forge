/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Viewport } from "."

describe("viewport", () => {
  let api
  let entity

  beforeEach(() => {
    entity = {
      id: "viewport",
      type: "Viewport",
    }

    api = {
      notify: vi.fn(),
    }

    window.innerWidth = 1024
    window.innerHeight = 768
  })

  describe("create()", () => {
    it("should initialize the entity state and seed the current size", () => {
      Viewport.create(entity, undefined, api)

      expect(entity.width).toBe(1024)
      expect(entity.height).toBe(768)
      expect(entity.isSupported).toBe(true)
      expect(entity.isWatching).toBe(true)
    })

    it("should notify size changes on window resize", () => {
      Viewport.create(entity, undefined, api)

      window.innerWidth = 500
      window.innerHeight = 400
      window.dispatchEvent(new Event("resize"))

      expect(api.notify).toHaveBeenCalledWith("#viewport:viewportChange", {
        width: 500,
        height: 400,
      })
    })
  })

  describe("viewportChange()", () => {
    it("should store the latest dimensions", () => {
      Viewport.viewportChange(entity, { width: 800, height: 600 })

      expect(entity.width).toBe(800)
      expect(entity.height).toBe(600)
    })
  })

  describe("viewportUnwatch()", () => {
    it("should stop notifying after unwatch", () => {
      Viewport.create(entity, undefined, api)
      Viewport.viewportUnwatch(entity)
      api.notify.mockClear()

      window.dispatchEvent(new Event("resize"))

      expect(api.notify).not.toHaveBeenCalled()
      expect(entity.isWatching).toBe(false)
      expect(entity._listener).toBe(null)
    })
  })

  describe("destroy()", () => {
    it("should remove the resize listener", () => {
      Viewport.create(entity, undefined, api)
      Viewport.destroy(entity)
      api.notify.mockClear()

      window.dispatchEvent(new Event("resize"))

      expect(api.notify).not.toHaveBeenCalled()
    })
  })
})
