/**
 * @vitest-environment jsdom
 */
import { render, svg } from "lit-html"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderLegend } from "./legend.js"

describe("renderLegend", () => {
  let entity
  let props
  let api

  beforeEach(() => {
    entity = {
      id: "test-chart",
      type: "line",
      data: [],
      width: 800,
      height: 400,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    props = {
      series: [
        { name: "Product A", color: "#3b82f6" },
        { name: "Product B", color: "#ef4444" },
        { name: "Product C", color: "#10b981" },
      ],
      colors: ["#3b82f6", "#ef4444", "#10b981"],
      width: 800,
      padding: { top: 20, right: 50, bottom: 30, left: 50 },
    }

    api = {
      notify: vi.fn(),
    }
  })

  describe("basic rendering", () => {
    it("should render legend with series", () => {
      const result = renderLegend(entity, props, api)
      const container = document.createElement("div")
      // Wrap in SVG since renderLegend returns SVG fragment
      render(svg`<svg>${result}</svg>`, container)

      const legend = container.querySelector("g.iw-chart-legend-wrapper")
      expect(legend).toBeTruthy()

      const items = container.querySelectorAll("g.iw-chart-legend-item")
      expect(items.length).toBe(3)
    })

    it("should render legend items with colors and labels", () => {
      const result = renderLegend(entity, props, api)
      const container = document.createElement("div")
      render(svg`<svg>${result}</svg>`, container)

      const items = container.querySelectorAll("g.iw-chart-legend-item")
      items.forEach((item, index) => {
        const rect = item.querySelector("rect")
        const text = item.querySelector("text")

        expect(rect).toBeTruthy()
        expect(text).toBeTruthy()
        expect(rect.getAttribute("fill")).toBe(props.series[index].color)
        expect(text.textContent).toContain(props.series[index].name)
      })
    })
  })

  describe("with empty series", () => {
    it("should return empty template for empty series", () => {
      props.series = []

      const result = renderLegend(entity, props, api)
      const container = document.createElement("div")
      render(svg`<svg>${result}</svg>`, container)

      // Should return empty template
      const legend = container.querySelector("g.iw-chart-legend-wrapper")
      expect(legend).toBeFalsy()
    })
  })

  describe("with default colors", () => {
    it("should use default colors when series color is not provided", () => {
      props.series = [{ name: "Series A" }, { name: "Series B" }]
      props.colors = ["#3b82f6", "#ef4444"]

      const result = renderLegend(entity, props, api)
      const container = document.createElement("div")
      render(svg`<svg>${result}</svg>`, container)

      const items = container.querySelectorAll("g.iw-chart-legend-item")
      expect(items.length).toBe(2)

      const firstRect = items[0].querySelector("rect")
      expect(firstRect.getAttribute("fill")).toBe("#3b82f6")
    })
  })
})
