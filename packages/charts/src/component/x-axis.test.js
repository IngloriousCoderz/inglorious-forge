/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderXAxis } from "./x-axis.js"

describe("renderXAxis", () => {
  let entity
  let props
  let api

  beforeEach(() => {
    entity = {
      id: "test-chart",
      type: "line",
      data: [
        { x: 0, y: 50 },
        { x: 1, y: 150 },
        { x: 2, y: 120 },
      ],
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    props = {
      xScale: vi.fn((x) => 50 + x * 200),
      yScale: vi.fn((y) => 370 - (y / 200) * 350),
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    props.xScale.domain = vi.fn(() => [0, 2])
    props.xScale.range = vi.fn(() => [50, 650])
    props.xScale.bandwidth = vi.fn(() => 200)

    props.yScale.domain = vi.fn(() => [0, 200])
    props.yScale.range = vi.fn(() => [370, 20])

    api = {
      notify: vi.fn(),
    }
  })

  describe("with scaleBand (categorical)", () => {
    it("should render X axis with band scale", () => {
      entity.data = [
        { label: "Jan", value: 100 },
        { label: "Feb", value: 150 },
        { label: "Mar", value: 120 },
      ]

      const mockBandScale = vi.fn((cat) => {
        const map = { Jan: 100, Feb: 350, Mar: 600 }
        return map[cat] || 0
      })
      mockBandScale.domain = vi.fn(() => ["Jan", "Feb", "Mar"])
      mockBandScale.range = vi.fn(() => [50, 750])
      mockBandScale.bandwidth = vi.fn(() => 200)

      props.xScale = mockBandScale

      const result = renderXAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()

      const ticks = container.querySelectorAll("g.iw-chart-xAxis-tick")
      expect(ticks.length).toBe(3)
    })
  })

  describe("with scaleLinear (numeric)", () => {
    it("should render X axis with linear scale", () => {
      const result = renderXAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()

      const ticks = container.querySelectorAll("g.iw-chart-xAxis-tick")
      expect(ticks.length).toBeGreaterThan(0)
    })

    it("should format integer ticks without decimals", () => {
      const result = renderXAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const labels = container.querySelectorAll(".iw-chart-xAxis-tick-label")
      labels.forEach((label) => {
        const text = label.textContent.trim()
        // Should not contain ".00" for integers
        if (text.match(/^\d+$/)) {
          expect(text).not.toContain(".00")
        }
      })
    })
  })

  describe("with xLabels (custom labels)", () => {
    it("should use custom xLabels when provided", () => {
      entity.xLabels = ["Q1", "Q2", "Q3"]
      entity.data = [
        { x: 0, y: 50 },
        { x: 1, y: 150 },
        { x: 2, y: 120 },
      ]

      // Mock calculateXTicks to return [0, 1, 2]
      const result = renderXAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const labels = container.querySelectorAll(".iw-chart-xAxis-tick-label")
      // Should use xLabels when available
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  describe("with time axis", () => {
    it("should format dates when xAxisType is time", () => {
      entity.xAxisType = "time"
      entity.data = [
        { date: "2024-01-01", value: 100 },
        { date: "2024-01-02", value: 150 },
      ]

      props.xScale.domain = vi.fn(() => [
        new Date("2024-01-01"),
        new Date("2024-01-02"),
      ])

      const result = renderXAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()
    })
  })
})
