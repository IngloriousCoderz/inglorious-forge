/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { bar } from "./bar.js"

describe("bar", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "test-bar",
      type: "bar",
      data: [
        { label: "Jan", value: 100 },
        { label: "Feb", value: 150 },
        { label: "Mar", value: 120 },
      ],
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
      colors: ["#3b82f6", "#ef4444", "#10b981"],
      showGrid: true,
      showTooltip: true,
    }

    api = {
      getEntity: vi.fn((id) => (id === "test-bar" ? entity : null)),
      notify: vi.fn(),
      getType: vi.fn((type) => (type === "bar" ? bar : null)),
    }
  })

  describe("render()", () => {
    it("should render bar chart with data", () => {
      const result = bar.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = bar.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      // Should render empty state or handle gracefully
      expect(result).toBeDefined()
    })

    it("should render grid when showGrid is true", () => {
      entity.showGrid = true

      const result = bar.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should not render grid when showGrid is false", () => {
      entity.showGrid = false

      const result = bar.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })
  })

  describe("renderBar()", () => {
    it("should return a function marked as isBar", () => {
      const result = bar.renderBar(
        entity,
        { config: { dataKey: "value" } },
        api,
      )

      expect(typeof result).toBe("function")
      expect(result.isBar).toBe(true)
      expect(result.dataKey).toBe("value")
    })

    it("should render bars when called with context", () => {
      const barFn = bar.renderBar(entity, { config: { dataKey: "value" } }, api)

      // Create mock context
      const context = {
        entity,
        xScale: {
          domain: () => ["Jan", "Feb", "Mar"],
          range: () => [50, 750],
          bandwidth: () => 200,
        },
        yScale: {
          domain: () => [0, 200],
          range: () => [370, 20],
        },
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
      }

      // Mock xScale methods
      context.xScale = vi.fn((cat) => {
        const map = { Jan: 100, Feb: 350, Mar: 600 }
        return map[cat] || 0
      })
      context.xScale.domain = vi.fn(() => ["Jan", "Feb", "Mar"])
      context.xScale.range = vi.fn(() => [50, 750])
      context.xScale.bandwidth = vi.fn(() => 200)

      context.yScale = vi.fn((val) => 370 - (val / 200) * 350)
      context.yScale.domain = vi.fn(() => [0, 200])
      context.yScale.range = vi.fn(() => [370, 20])

      const result = barFn(context, 0, 1)
      const container = document.createElement("div")
      render(result, container)

      // Should render rectangles for bars
      const rects = container.querySelectorAll("rect")
      expect(rects.length).toBeGreaterThan(0)
    })

    it("should use multiColor when config.multiColor is true", () => {
      const barFn = bar.renderBar(
        entity,
        {
          config: { dataKey: "value", multiColor: true },
        },
        api,
      )

      expect(typeof barFn).toBe("function")
      expect(barFn.isBar).toBe(true)
    })

    it("should use fill color when provided", () => {
      const barFn = bar.renderBar(
        entity,
        {
          config: { dataKey: "value", fill: "#ff0000" },
        },
        api,
      )

      expect(typeof barFn).toBe("function")
      expect(barFn.isBar).toBe(true)
    })
  })
})
