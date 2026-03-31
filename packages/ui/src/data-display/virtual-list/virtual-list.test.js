/**
 * @vitest-environment jsdom
 */
import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VirtualList } from "."

describe("virtualList", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "test-list",
      type: "TestItemType",
      items: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      })),
    }

    api = {
      notify: vi.fn(),
      getType: vi.fn().mockReturnValue({
        renderItem: (entity, { item, index }) =>
          html`<div class="iw-list-item">${index}: ${item.name}</div>`,
      }),
    }
  })

  describe("create()", () => {
    it("should set default list properties on init", () => {
      VirtualList.create(entity)

      expect(entity.scrollTop).toBe(0)
      expect(entity.visibleRange).toEqual({ start: 0, end: 20 })
      expect(entity.viewportHeight).toBe(600)
      expect(entity.bufferSize).toBe(5)
      expect(entity.itemHeight).toBeNull()
      expect(entity.estimatedHeight).toBe(50)
    })

    it("should not overwrite existing properties (except scrollTop)", () => {
      entity.viewportHeight = 800
      entity.visibleRange = { start: 10, end: 30 }

      VirtualList.create(entity)

      expect(entity.viewportHeight).toBe(800)
      expect(entity.visibleRange).toEqual({ start: 10, end: 30 })
      expect(entity.scrollTop).toBe(0)
    })
  })

  describe("scroll()", () => {
    beforeEach(() => {
      VirtualList.create(entity)
    })

    it("should calculate visible range using itemHeight", () => {
      entity.itemHeight = 20

      VirtualList.scroll(entity, { scrollTop: 200 })

      expect(entity.visibleRange).toEqual({ start: 5, end: 40 })
      expect(entity.scrollTop).toBe(200)
    })

    it("should fall back to estimatedHeight if itemHeight is null", () => {
      entity.estimatedHeight = 50

      VirtualList.scroll(entity, { scrollTop: 500 })

      expect(entity.visibleRange).toEqual({ start: 5, end: 22 })
    })

    it("should not update state if visible range does not change", () => {
      entity.itemHeight = 20
      entity.visibleRange = { start: 5, end: 40 }

      const snapshot = { ...entity.visibleRange }

      VirtualList.scroll(entity, { scrollTop: 201 })

      expect(entity.visibleRange).toEqual(snapshot)
    })

    it("should clamp start index to zero", () => {
      entity.itemHeight = 20
      entity.bufferSize = 10

      VirtualList.scroll(entity, { scrollTop: 0 })

      expect(entity.visibleRange.start).toBe(0)
    })

    it("should handle scrolling near the bottom", () => {
      entity.itemHeight = 20

      VirtualList.scroll(entity, { scrollTop: 1900 })

      expect(entity.visibleRange).toEqual({ start: 90, end: 100 })
    })
  })

  describe("mount()", () => {
    it("should measure first item and update itemHeight and visibleRange", () => {
      VirtualList.create(entity)

      const itemEl = document.createElement("div")
      vi.spyOn(itemEl, "offsetHeight", "get").mockReturnValue(40)

      const containerEl = {
        querySelector: vi.fn().mockReturnValue(itemEl),
      }

      VirtualList.mount(entity, containerEl)

      expect(entity.itemHeight).toBe(40)
      expect(entity.visibleRange).toEqual({ start: 0, end: 15 })
    })

    it("should do nothing if no item is found", () => {
      VirtualList.create(entity)
      const snapshot = { ...entity }

      VirtualList.mount(entity, { querySelector: () => null })

      expect(entity).toEqual(snapshot)
    })

    it("should overwrite itemHeight when mounting", () => {
      VirtualList.create(entity)
      entity.itemHeight = 42

      VirtualList.mount(entity, {
        querySelector: () => ({ offsetHeight: 100 }),
      })

      expect(entity.itemHeight).toBe(100)
    })
  })

  describe("render()", () => {
    it("should return an empty template and warn if items are missing", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
      delete entity.items

      const result = VirtualList.render(entity, api)

      expect(spy).toHaveBeenCalledWith(
        `virtual list entity ${entity.id} needs 'items'`,
      )
      render(result, document.createElement("div"))

      spy.mockRestore()
    })

    it("should return an empty template and warn if renderItem is missing", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
      api.getType.mockReturnValue({})

      const result = VirtualList.render(entity, api)

      expect(spy).toHaveBeenCalledWith(
        `type ${entity.type} needs 'renderItem' method`,
      )
      render(result, document.createElement("div"))

      spy.mockRestore()
    })

    it("should render only items in the visible range", () => {
      VirtualList.create(entity)
      entity.itemHeight = 50
      entity.visibleRange = { start: 10, end: 15 }

      const container = document.createElement("div")
      render(VirtualList.render(entity, api), container)

      const items = container.querySelectorAll("[data-index]")
      const indices = [...items].map((el) => Number(el.dataset.index))

      expect(indices).toEqual([10, 11, 12, 13, 14])
    })

    it("should set the correct total spacer height", () => {
      VirtualList.create(entity)
      entity.itemHeight = 40

      const container = document.createElement("div")
      render(VirtualList.render(entity, api), container)

      const spacer = container.querySelector("div > div > div")
      expect(spacer.style.height).toBe("4000px")
    })

    it("should update rendered items after scrolling (integration test)", () => {
      VirtualList.create(entity)
      entity.itemHeight = 50

      const container = document.createElement("div")
      render(VirtualList.render(entity, api), container)

      VirtualList.scroll(entity, { scrollTop: 500 }) // ~item 10
      render(VirtualList.render(entity, api), container)

      const indices = [...container.querySelectorAll("[data-index]")].map(
        (el) => Number(el.dataset.index),
      )

      expect(indices[0]).toBeGreaterThanOrEqual(5)
    })
  })

  describe("renderItem()", () => {
    it("should render the default item view", () => {
      const item = { id: 1, value: "test" }

      const container = document.createElement("div")
      render(VirtualList.renderItem(null, { item, index: 5 }), container)

      const el = container.querySelector(".iw-list-item")
      expect(el).toBeTruthy()
      expect(el.textContent).toContain("6.")
      expect(el.textContent).toContain('"value":"test"')
    })
  })
})
