/**
 * @vitest-environment jsdom
 */
import { html, render, svg } from "lit-html"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { area } from "./area.js"

describe("area", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "test-area",
      type: "area",
      data: [
        { x: 0, y: 50 },
        { x: 1, y: 150 },
        { x: 2, y: 120 },
        { x: 3, y: 180 },
      ],
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
      colors: ["#3b82f6", "#ef4444", "#10b981"],
      showGrid: true,
      showTooltip: true,
      showPoints: true,
    }

    api = {
      getEntity: vi.fn((id) => (id === "test-area" ? entity : null)),
      notify: vi.fn(),
      getType: vi.fn().mockReturnValue({
        renderTooltip: () => "",
      }),
    }
  })

  describe("renderChart()", () => {
    it("should render area chart with data", () => {
      const result = area.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = area.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      expect(result).toBeDefined()
    })
  })

  describe("renderAreaChart()", () => {
    it("should render area chart with children", () => {
      const children = [
        area.renderCartesianGrid(entity, {}, api),
        area.renderXAxis(entity, {}, api),
        area.renderYAxis(entity, {}, api),
        area.renderArea(entity, { config: { dataKey: "value" } }, api),
      ]

      const result = area.renderAreaChart(
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
      const result = area.renderAreaChart(null, { children: [] }, api)
      const container = document.createElement("div")
      render(result, container)

      expect(container.textContent).toContain("Entity not found")
    })

    it("should handle stacked areas when stackId is provided", () => {
      const children = [
        area.renderArea(
          entity,
          {
            config: { dataKey: "value", stackId: "stack1" },
          },
          api,
        ),
        area.renderArea(
          entity,
          {
            config: { dataKey: "value2", stackId: "stack1" },
          },
          api,
        ),
      ]

      entity.data = [
        { name: "0", value: 50, value2: 30 },
        { name: "1", value: 150, value2: 80 },
      ]

      const result = area.renderAreaChart(
        entity,
        {
          children,
          config: {
            width: 800,
            height: 400,
            dataKeys: ["value", "value2"],
          },
        },
        api,
      )
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it('should fallback to entity dimensions when config width/height are percentages ("100%")', () => {
      entity.data = [
        { name: "Jan", value: 50 },
        { name: "Feb", value: 150 },
      ]

      const children = [
        area.renderArea(entity, { config: { dataKey: "value" } }, api),
      ]

      const result = area.renderAreaChart(
        entity,
        { children, config: { width: "100%", height: "100%" } },
        api,
      )
      const container = document.createElement("div")
      render(result, container)

      const svgEl = container.querySelector("svg")
      expect(svgEl).toBeTruthy()
      expect(svgEl.getAttribute("width")).toBe(String(entity.width))
      expect(svgEl.getAttribute("height")).toBe(String(entity.height))
    })
  })

  describe("renderArea()", () => {
    it("should return a function marked as isArea", () => {
      const result = area.renderArea(
        entity,
        {
          config: { dataKey: "value" },
        },
        api,
      )

      expect(typeof result).toBe("function")
      expect(result.isArea).toBe(true)
    })

    it("should render area when called with context", () => {
      const areaFn = area.renderArea(
        entity,
        {
          config: { dataKey: "value" },
        },
        api,
      )

      const context = {
        entity,
        xScale: vi.fn((x) => 50 + x * 200),
        yScale: vi.fn((y) => 370 - (y / 200) * 350),
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
      }

      context.xScale.domain = vi.fn(() => [0, 3])
      context.xScale.range = vi.fn(() => [50, 750])

      context.yScale.domain = vi.fn(() => [0, 200])
      context.yScale.range = vi.fn(() => [370, 20])

      entity.data = [
        { name: "0", value: 50 },
        { name: "1", value: 150 },
        { name: "2", value: 120 },
      ]

      const result = areaFn(context)
      const container = document.createElement("div")
      render(result, container)

      // Should render path for area
      const path = container.querySelector("path")
      expect(path).toBeTruthy()
    })

    it("should support fill and stroke colors", () => {
      const areaFn = area.renderArea(
        entity,
        {
          config: { dataKey: "value", fill: "#ff0000", stroke: "#00ff00" },
        },
        api,
      )

      expect(typeof areaFn).toBe("function")
      expect(areaFn.isArea).toBe(true)
    })
  })

  describe("renderDots()", () => {
    it("should return a function marked as isDots", () => {
      const result = area.renderDots(
        entity,
        { config: { dataKey: "value" } },
        api,
      )

      expect(typeof result).toBe("function")
      expect(result.isDots).toBe(true)
    })

    it("should render dots when called with context", () => {
      const dotsFn = area.renderDots(
        entity,
        {
          config: { dataKey: "value" },
        },
        api,
      )

      const context = {
        entity,
        xScale: vi.fn((x) => 50 + x * 200),
        yScale: vi.fn((y) => 370 - (y / 200) * 350),
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
      }

      context.xScale.domain = vi.fn(() => [0, 3])
      context.xScale.range = vi.fn(() => [50, 750])

      context.yScale.domain = vi.fn(() => [0, 200])
      context.yScale.range = vi.fn(() => [370, 20])

      entity.data = [
        { name: "0", value: 50 },
        { name: "1", value: 150 },
      ]

      const result = dotsFn(context)
      const container = document.createElement("div")
      render(result, container)

      // Should render circles for dots
      const circles = container.querySelectorAll("circle")
      expect(circles.length).toBeGreaterThan(0)
    })

    it("should notify api on dot hover (showTooltip/hideTooltip)", () => {
      entity.data = [
        { name: "Jan", value: 50 },
        { name: "Feb", value: 150 },
      ]

      const dotsFn = area.renderDots(
        entity,
        { config: { dataKey: "value", fill: "#ff0000" } },
        api,
      )

      const context = {
        entity,
        api,
        xScale: (x) => 50 + x * 200,
        yScale: (y) => 370 - (y / 200) * 350,
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
      }
      context.xScale.domain = vi.fn(() => [0, 1])
      context.xScale.range = vi.fn(() => [50, 750])
      context.yScale.domain = vi.fn(() => [0, 200])
      context.yScale.range = vi.fn(() => [370, 20])

      const dots = dotsFn(context)
      const container = document.createElement("div")
      render(
        html`<div class="iw-chart">
          ${svg`<svg width="800" height="400">${dots}</svg>`}
        </div>`,
        container,
      )

      const circle = container.querySelector("circle")
      expect(circle).toBeTruthy()

      circle.dispatchEvent(
        new MouseEvent("mouseenter", {
          bubbles: true,
          clientX: 100,
          clientY: 50,
        }),
      )

      expect(api.notify).toHaveBeenCalledWith(
        `#${entity.id}:showTooltip`,
        expect.objectContaining({
          label: "Jan",
          value: 50,
          color: "#ff0000",
        }),
      )

      circle.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }))
      expect(api.notify).toHaveBeenCalledWith(`#${entity.id}:hideTooltip`)
    })
  })

  describe("renderXAxis()", () => {
    it("should return a function", () => {
      const result = area.renderXAxis(entity, {}, api)

      expect(typeof result).toBe("function")
    })
  })

  describe("renderYAxis()", () => {
    it("should return a function", () => {
      const result = area.renderYAxis(entity, {}, api)

      expect(typeof result).toBe("function")
    })
  })

  describe("renderCartesianGrid()", () => {
    it("should return a function marked as isGrid", () => {
      const result = area.renderCartesianGrid(entity, {}, api)

      expect(typeof result).toBe("function")
      expect(result.isGrid).toBe(true)
    })
  })
})
