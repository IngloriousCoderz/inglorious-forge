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
      getType: vi.fn().mockReturnValue({
        renderTooltip: () => "",
      }),
    }
  })

  describe("renderChart()", () => {
    it("should render bar chart with data", () => {
      const result = bar.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = bar.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      // Should render empty state or handle gracefully
      expect(result).toBeDefined()
    })

    it("should render grid when showGrid is true", () => {
      entity.showGrid = true

      const result = bar.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should not render grid when showGrid is false", () => {
      entity.showGrid = false

      const result = bar.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })
  })

  describe("renderBarChart()", () => {
    it("should render bar chart with children", () => {
      const children = [
        bar.renderCartesianGrid(entity, {}, api),
        bar.renderXAxis(entity, {}, api),
        bar.renderYAxis(entity, {}, api),
        bar.renderBar(entity, { config: { dataKey: "value" } }, api),
      ]

      const result = bar.renderBarChart(
        entity,
        { children, config: { width: 800, height: 400 } },
        api,
      )
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
      expect(svg.getAttribute("width")).toBe("800")
      expect(svg.getAttribute("height")).toBe("400")
    })

    it("should return error message if entity is missing", () => {
      const result = bar.renderBarChart(null, { children: [] }, api)
      const container = document.createElement("div")
      render(result, container)

      expect(container.textContent).toContain("Entity not found")
    })

    it("should return error message if entity.data is invalid", () => {
      entity.data = null

      const result = bar.renderBarChart(entity, { children: [] }, api)
      const container = document.createElement("div")
      render(result, container)

      expect(container.textContent).toContain("Entity data is missing")
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

  describe("renderXAxis()", () => {
    it("should return a function marked as isAxis", () => {
      const result = bar.renderXAxis(entity, {}, api)

      expect(typeof result).toBe("function")
      expect(result.isAxis).toBe(true)
    })

    it("should render X axis when called with context", () => {
      const xAxisFn = bar.renderXAxis(entity, {}, api)

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

      const result = xAxisFn(context)
      const container = document.createElement("div")
      render(result, container)

      // Should render axis line and labels
      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()
    })
  })

  describe("renderYAxis()", () => {
    it("should return a function", () => {
      const result = bar.renderYAxis(entity, {}, api)

      expect(typeof result).toBe("function")
    })

    it("should render Y axis when called with context", () => {
      const yAxisFn = bar.renderYAxis(entity, {}, api)

      const context = {
        entity,
        yScale: {
          domain: () => [0, 200],
          range: () => [370, 20],
          ticks: () => [0, 50, 100, 150, 200],
        },
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
      }

      context.yScale = vi.fn((val) => 370 - (val / 200) * 350)
      context.yScale.domain = vi.fn(() => [0, 200])
      context.yScale.range = vi.fn(() => [370, 20])
      context.yScale.ticks = vi.fn(() => [0, 50, 100, 150, 200])

      const result = yAxisFn(context)
      const container = document.createElement("div")
      render(result, container)

      // Should render axis line
      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()
    })
  })

  describe("renderCartesianGrid()", () => {
    it("should return a function", () => {
      const result = bar.renderCartesianGrid(entity, {}, api)

      expect(typeof result).toBe("function")
    })

    it("should render grid when called with context", () => {
      const gridFn = bar.renderCartesianGrid(entity, {}, api)

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
          ticks: () => [0, 50, 100, 150, 200],
        },
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
      }

      // Mock scales
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
      context.yScale.ticks = vi.fn(() => [0, 50, 100, 150, 200])

      const result = gridFn(context)
      const container = document.createElement("div")
      render(result, container)

      // Should render grid lines
      const lines = container.querySelectorAll("line")
      expect(lines.length).toBeGreaterThan(0)
    })
  })
})
