/**
 * @vitest-environment jsdom
 */
import { html, svg } from "@inglorious/web"
import { render } from "@inglorious/web/test"
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
      getType: vi.fn((type) => (type === "area" ? area : null)),
    }
  })

  describe("render()", () => {
    it("should render area chart with data", () => {
      const result = area.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = area.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      expect(result).toBeDefined()
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
        `#${entity.id}:tooltipShow`,
        expect.objectContaining({
          label: "Jan",
          value: 50,
          color: "#ff0000",
        }),
      )

      circle.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }))
      expect(api.notify).toHaveBeenCalledWith(`#${entity.id}:tooltipHide`)
    })
  })
})
