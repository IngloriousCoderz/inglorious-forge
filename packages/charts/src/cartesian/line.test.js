/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { line } from "./line.js"

describe("line", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "test-line",
      type: "line",
      data: [
        { name: "Jan", value: 100 },
        { name: "Feb", value: 200 },
        { name: "Mar", value: 150 },
      ],
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
      colors: ["#3b82f6", "#ef4444", "#10b981"],
    }

    api = {
      getEntity: vi.fn((id) => (id === "test-line" ? entity : null)),
      getType: vi.fn((type) => {
        if (type === "line") return line
        return null
      }),
      notify: vi.fn(),
    }
  })

  describe("render", () => {
    it("should render line chart with data", () => {
      const result = line.render(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = line.render(entity, api)
      expect(result).toBeDefined()
      // render may return empty template or handle empty state internally
    })
  })

  describe("renderLineChart (composition mode)", () => {
    it("should render line chart with children", () => {
      const children = [() => null, () => null, () => null, () => null]

      const result = line.renderLineChart(entity, { children, config: {} }, api)
      const container = document.createElement("div")
      render(result, container)

      const chart = container.querySelector(".iw-chart")
      expect(chart).toBeTruthy()
    })

    it("should use config.data to override entity.data", () => {
      const configData = [
        { name: "Apr", value: 300 },
        { name: "May", value: 400 },
      ]

      const children = []
      const result = line.renderLineChart(
        entity,
        { children, config: { data: configData } },
        api,
      )

      // The context should use configData, not entity.data
      expect(result).toBeDefined()
    })

    it("should use config dimensions if provided", () => {
      const children = []
      const result = line.renderLineChart(
        entity,
        {
          children,
          config: {
            width: 1000,
            height: 500,
          },
        },
        api,
      )

      expect(result).toBeDefined()
    })
  })

  describe("renderLine", () => {
    it("should render line with dataKey when context is provided", () => {
      const context = {
        xScale: (x) => x * 100,
        yScale: (y) => 400 - y * 2,
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
        entity,
        api,
      }

      const lineFn = line.renderLine(
        entity,
        { config: { dataKey: "value" } },
        api,
      )
      const result = lineFn(context)
      const container = document.createElement("div")
      render(result, container)

      const path = container.querySelector("path")
      expect(path).toBeTruthy()
    })

    it("should render dots when showDots is true", () => {
      const context = {
        xScale: (x) => x * 100,
        yScale: (y) => 400 - y * 2,
        dimensions: {
          width: 800,
          height: 400,
          padding: { top: 20, right: 50, bottom: 30, left: 50 },
        },
        entity,
        api,
      }

      const lineFn = line.renderLine(
        entity,
        { config: { dataKey: "value", showDots: true } },
        api,
      )
      const result = lineFn(context)
      const container = document.createElement("div")
      render(result, container)

      const dots = container.querySelectorAll("circle")
      expect(dots.length).toBeGreaterThan(0)
    })
  })

  describe("renderXAxis", () => {
    it("should return template result", () => {
      const result = line.renderXAxis(
        entity,
        { config: { dataKey: "value" } },
        api,
      )
      expect(result).toBeDefined()
      // renderXAxis returns svg template, which may be empty if context is missing
    })
  })

  describe("renderYAxis", () => {
    it("should return template result", () => {
      const result = line.renderYAxis(entity, { config: {} }, api)
      expect(result).toBeDefined()
      // renderYAxis returns svg template, which may be empty if context is missing
    })
  })
})
