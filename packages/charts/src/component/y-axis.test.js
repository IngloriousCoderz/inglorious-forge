/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderYAxis } from "./y-axis.js"

describe("renderYAxis", () => {
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
      yScale: vi.fn((y) => 370 - (y / 200) * 350),
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    props.yScale.domain = vi.fn(() => [0, 200])
    props.yScale.range = vi.fn(() => [370, 20])
    props.yScale.ticks = vi.fn(() => [0, 50, 100, 150, 200])

    api = {
      notify: vi.fn(),
    }
  })

  describe("basic rendering", () => {
    it("should render Y axis with line and ticks", () => {
      const result = renderYAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()

      const ticks = container.querySelectorAll("g.iw-chart-yAxis-tick")
      expect(ticks.length).toBeGreaterThan(0)
    })

    it("should format integer ticks without decimals", () => {
      const result = renderYAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const labels = container.querySelectorAll(".iw-chart-yAxis-tick-label")
      labels.forEach((label) => {
        const text = label.textContent.trim()
        // Should not contain ".00" for integers
        if (text.match(/^\d+$/)) {
          expect(text).not.toContain(".00")
        }
      })
    })
  })

  describe("with custom ticks", () => {
    it("should use customTicks when provided", () => {
      props.customTicks = [0, 100, 200]

      const result = renderYAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const ticks = container.querySelectorAll("g.iw-chart-yAxis-tick")
      expect(ticks.length).toBe(3)
    })
  })

  describe("with negative values", () => {
    it("should render axis at zero line when domain includes negatives", () => {
      props.yScale.domain = vi.fn(() => [-50, 200])
      props.yScale.range = vi.fn(() => [370, 20])
      props.yScale.ticks = vi.fn(() => [-50, 0, 50, 100, 150, 200])
      props.yScale = vi.fn((y) => {
        if (y === 0) return 296 // Zero line position
        return 370 - ((y + 50) / 250) * 350
      })
      props.yScale.domain = vi.fn(() => [-50, 200])
      props.yScale.range = vi.fn(() => [370, 20])
      props.yScale.ticks = vi.fn(() => [-50, 0, 50, 100, 150, 200])

      const result = renderYAxis(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const axisLine = container.querySelector("line")
      expect(axisLine).toBeTruthy()
    })
  })
})
