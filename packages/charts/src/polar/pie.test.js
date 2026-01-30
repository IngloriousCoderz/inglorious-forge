/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { pie } from "./pie.js"

describe("pie", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "test-pie",
      type: "pie",
      data: [
        { name: "Category A", value: 20 },
        { name: "Category B", value: 35 },
        { name: "Category C", value: 15 },
        { name: "Category D", value: 10 },
      ],
      width: 500,
      height: 400,
      colors: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
      showTooltip: true,
    }

    api = {
      getEntity: vi.fn((id) => (id === "test-pie" ? entity : null)),
      notify: vi.fn(),
      getType: vi.fn().mockReturnValue({
        renderTooltip: () => "",
      }),
    }
  })

  describe("renderChart()", () => {
    it("should render pie chart with data", () => {
      const result = pie.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })

    it("should handle empty data gracefully", () => {
      entity.data = []

      const result = pie.renderChart(entity, api)
      const container = document.createElement("div")
      render(result, container)

      expect(result).toBeDefined()
    })
  })

  describe("renderPieChart()", () => {
    it("should render pie chart with children", () => {
      const children = [
        pie.renderPie(
          entity,
          {
            config: { dataKey: "value", nameKey: "name" },
          },
          api,
        ),
      ]

      const result = pie.renderPieChart(
        entity,
        { children, config: { width: 500, height: 400 } },
        api,
      )
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
      expect(svg.getAttribute("width")).toBe("500")
      expect(svg.getAttribute("height")).toBe("400")
    })

    it("should return error message if entity is missing", () => {
      const result = pie.renderPieChart(null, { children: [] }, api)
      const container = document.createElement("div")
      render(result, container)

      expect(container.textContent).toContain("Entity not found")
    })

    it("should use custom cx and cy when provided", () => {
      const children = [
        pie.renderPie(
          entity,
          {
            config: { dataKey: "value", nameKey: "name" },
          },
          api,
        ),
      ]

      const result = pie.renderPieChart(
        entity,
        {
          children,
          config: { width: 500, height: 400, cx: "35%", cy: "35%" },
        },
        api,
      )
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()
    })
  })

  describe("renderPie()", () => {
    it("should return a function marked as isPie", () => {
      const result = pie.renderPie(
        entity,
        {
          config: { dataKey: "value", nameKey: "name" },
        },
        api,
      )

      expect(typeof result).toBe("function")
      expect(result.isPie).toBe(true)
    })

    it("should render pie sectors when called with context", () => {
      const pieFn = pie.renderPie(
        entity,
        {
          config: { dataKey: "value", nameKey: "name" },
        },
        api,
      )

      const context = {
        entity,
        width: 500,
        height: 400,
        cx: 250,
        cy: 200,
        api,
        colors: entity.colors,
      }

      const result = pieFn(context)
      const container = document.createElement("div")
      render(result, container)

      // Should render paths for pie sectors
      const paths = container.querySelectorAll("path")
      expect(paths.length).toBeGreaterThan(0)
    })

    it("should support innerRadius for donut charts", () => {
      const pieFn = pie.renderPie(
        entity,
        {
          config: {
            dataKey: "value",
            nameKey: "name",
            innerRadius: 50,
          },
        },
        api,
      )

      expect(typeof pieFn).toBe("function")
      expect(pieFn.isPie).toBe(true)
    })

    it("should support custom outerRadius", () => {
      const pieFn = pie.renderPie(
        entity,
        {
          config: {
            dataKey: "value",
            nameKey: "name",
            outerRadius: 150,
          },
        },
        api,
      )

      expect(typeof pieFn).toBe("function")
      expect(pieFn.isPie).toBe(true)
    })

    it("should support paddingAngle", () => {
      const pieFn = pie.renderPie(
        entity,
        {
          config: {
            dataKey: "value",
            nameKey: "name",
            paddingAngle: 5,
          },
        },
        api,
      )

      expect(typeof pieFn).toBe("function")
      expect(pieFn.isPie).toBe(true)
    })

    it("should support minAngle", () => {
      const pieFn = pie.renderPie(
        entity,
        {
          config: {
            dataKey: "value",
            nameKey: "name",
            minAngle: 10,
          },
        },
        api,
      )

      expect(typeof pieFn).toBe("function")
      expect(pieFn.isPie).toBe(true)
    })

    it("should support cornerRadius", () => {
      const pieFn = pie.renderPie(
        entity,
        {
          config: {
            dataKey: "value",
            nameKey: "name",
            cornerRadius: 10,
          },
        },
        api,
      )

      expect(typeof pieFn).toBe("function")
      expect(pieFn.isPie).toBe(true)
    })

    it("should support custom dataKey and nameKey", () => {
      entity.data = [
        { product: "Laptop", sales: 150 },
        { product: "Phone", sales: 200 },
      ]

      const pieFn = pie.renderPie(
        entity,
        {
          config: {
            dataKey: "sales",
            nameKey: "product",
          },
        },
        api,
      )

      expect(typeof pieFn).toBe("function")
      expect(pieFn.isPie).toBe(true)
    })
  })
})
