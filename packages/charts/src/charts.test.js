/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest"

import { charts } from "./index.js"
import {
  areaChart,
  barChart,
  donutChart,
  lineChart,
  pieChart,
} from "./utils/chart-utils.js"

const sampleBarData = [
  { label: "Jan", value: 100 },
  { label: "Feb", value: 150 },
  { label: "Mar", value: 120 },
]

const sampleLineData = [
  { x: 0, y: 50 },
  { x: 1, y: 150 },
  { x: 2, y: 120 },
]

const samplePieData = [
  { label: "Category A", value: 20 },
  { label: "Category B", value: 35 },
  { label: "Category C", value: 15 },
]

describe("charts", () => {
  describe("logic", () => {
    describe("create()", () => {
      it("should initialize with default state", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
        }

        charts.create(entity)

        expect(entity.width).toBe(800)
        expect(entity.height).toBe(400)
        expect(entity.padding).toBeDefined()
        expect(entity.data).toEqual([])
        expect(entity.colors).toEqual([
          "#3b82f6",
          "#ef4444",
          "#10b981",
          "#f59e0b",
          "#8b5cf6",
        ])
        expect(entity.showLegend).toBe(true)
        expect(entity.showGrid).toBe(true)
        expect(entity.showTooltip).toBe(true)
        expect(entity.tooltip).toBe(null)
        expect(entity.tooltipX).toBe(0)
        expect(entity.tooltipY).toBe(0)
        expect(entity.labelPosition).toBe("outside")
      })

      it("should preserve existing values", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
          width: 1000,
          height: 500,
          data: sampleBarData,
        }

        charts.create(entity)

        expect(entity.width).toBe(1000)
        expect(entity.height).toBe(500)
        expect(entity.data).toEqual(sampleBarData)
      })

      it("should detect time axis type from dates", () => {
        const entity = {
          id: "test-chart",
          type: "line",
          data: [{ date: "2024-01-01", value: 100 }],
        }

        charts.create(entity)

        expect(entity.xAxisType).toBe("time")
      })

      it("should default to linear axis type without dates", () => {
        const entity = {
          id: "test-chart",
          type: "line",
          data: sampleLineData,
        }

        charts.create(entity)

        expect(entity.xAxisType).toBe("linear")
      })
    })

    describe("updateData()", () => {
      it("should update chart data", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
          data: sampleBarData,
        }

        charts.create(entity)
        const newData = [{ label: "Apr", value: 200 }]
        charts.updateData(entity, newData)

        expect(entity.data).toEqual(newData)
      })
    })

    describe("resize()", () => {
      it("should update width and height", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
        }

        charts.create(entity)
        charts.resize(entity, 1200, 600)

        expect(entity.width).toBe(1200)
        expect(entity.height).toBe(600)
        expect(entity.padding).toBeDefined()
      })
    })

    describe("showTooltip()", () => {
      it("should set tooltip data and position", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
        }

        charts.create(entity)
        charts.showTooltip(entity, {
          label: "Jan",
          value: 100,
          color: "#3b82f6",
          x: 100,
          y: 200,
        })

        expect(entity.tooltip).toEqual({
          label: "Jan",
          value: 100,
          color: "#3b82f6",
        })
        expect(entity.tooltipX).toBe(100)
        expect(entity.tooltipY).toBe(200)
      })

      it("should set tooltip with percentage", () => {
        const entity = {
          id: "test-chart",
          type: "pie",
        }

        charts.create(entity)
        charts.showTooltip(entity, {
          label: "Category A",
          value: 20,
          percentage: 25,
          color: "#3b82f6",
          x: 150,
          y: 250,
        })

        expect(entity.tooltip).toEqual({
          label: "Category A",
          value: 20,
          percentage: 25,
          color: "#3b82f6",
        })
      })
    })

    describe("hideTooltip()", () => {
      it("should clear tooltip", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
        }

        charts.create(entity)
        charts.showTooltip(entity, {
          label: "Jan",
          value: 100,
          color: "#3b82f6",
          x: 100,
          y: 200,
        })
        charts.hideTooltip(entity)

        expect(entity.tooltip).toBe(null)
      })
    })

    describe("moveTooltip()", () => {
      it("should update tooltip position", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
        }

        charts.create(entity)
        charts.showTooltip(entity, {
          label: "Jan",
          value: 100,
          color: "#3b82f6",
          x: 100,
          y: 200,
        })
        charts.moveTooltip(entity, { x: 150, y: 250 })

        expect(entity.tooltipX).toBe(150)
        expect(entity.tooltipY).toBe(250)
      })

      it("should not update position if tooltip is not shown", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
        }

        charts.create(entity)
        charts.moveTooltip(entity, { x: 150, y: 250 })

        expect(entity.tooltipX).toBe(0)
        expect(entity.tooltipY).toBe(0)
      })
    })
  })

  describe("rendering", () => {
    describe("render()", () => {
      it("should render chart using api.getType", () => {
        const entity = {
          id: "test-chart",
          type: "bar",
          data: sampleBarData,
          width: 800,
          height: 400,
        }

        charts.create(entity)

        const mockApi = {
          getType: vi.fn(() => barChart),
        }

        const result = charts.render(entity, mockApi)

        expect(mockApi.getType).toHaveBeenCalledWith("bar")
        expect(result).toBeDefined()
      })

      it("should return error message for unknown chart type", () => {
        const entity = {
          id: "test-chart",
          type: "unknown",
        }

        charts.create(entity)

        const mockApi = {
          getType: vi.fn(() => null),
        }

        const result = charts.render(entity, mockApi)

        expect(mockApi.getType).toHaveBeenCalledWith("unknown")
        expect(result).toBeDefined()
      })
    })
  })

  describe("chart types", () => {
    describe("barChart", () => {
      it("should have create, render, and renderChart methods", () => {
        expect(barChart.create).toBeDefined()
        expect(barChart.render).toBeDefined()
        expect(barChart.renderChart).toBeDefined()
      })

      it("should render chart with data", () => {
        const entity = {
          id: "test-bar",
          type: "bar",
          data: sampleBarData,
          width: 800,
          height: 400,
        }

        barChart.create(entity)
        const result = barChart.renderChart(entity)

        expect(result).toBeDefined()
      })

      it("should render empty state when no data", () => {
        const entity = {
          id: "test-bar",
          type: "bar",
          data: [],
          width: 800,
          height: 400,
        }

        barChart.create(entity)
        const result = barChart.renderChart(entity)

        expect(result).toBeDefined()
      })
    })

    describe("lineChart", () => {
      it("should have create, render, and renderChart methods", () => {
        expect(lineChart.create).toBeDefined()
        expect(lineChart.render).toBeDefined()
        expect(lineChart.renderChart).toBeDefined()
      })

      it("should render chart with data", () => {
        const entity = {
          id: "test-line",
          type: "line",
          data: sampleLineData,
          width: 800,
          height: 400,
        }

        lineChart.create(entity)
        const result = lineChart.renderChart(entity)

        expect(result).toBeDefined()
      })
    })

    describe("areaChart", () => {
      it("should have renderChart method", () => {
        expect(areaChart.renderChart).toBeDefined()
      })

      it("should render chart with data", () => {
        const entity = {
          id: "test-area",
          type: "area",
          data: sampleLineData,
          width: 800,
          height: 400,
        }

        charts.create(entity)
        const result = areaChart.renderChart(entity)

        expect(result).toBeDefined()
      })
    })

    describe("pieChart", () => {
      it("should have create, render, and renderChart methods", () => {
        expect(pieChart.create).toBeDefined()
        expect(pieChart.render).toBeDefined()
        expect(pieChart.renderChart).toBeDefined()
      })

      it("should render chart with data", () => {
        const entity = {
          id: "test-pie",
          type: "pie",
          data: samplePieData,
          width: 800,
          height: 400,
        }

        pieChart.create(entity)
        const result = pieChart.renderChart(entity, {})

        expect(result).toBeDefined()
      })
    })

    describe("donutChart", () => {
      it("should have create, render, and renderChart methods", () => {
        expect(donutChart.create).toBeDefined()
        expect(donutChart.render).toBeDefined()
        expect(donutChart.renderChart).toBeDefined()
      })

      it("should render chart with data", () => {
        const entity = {
          id: "test-donut",
          type: "donut",
          data: samplePieData,
          width: 400,
          height: 400,
        }

        donutChart.create(entity)
        const result = donutChart.renderChart(entity, {})

        expect(result).toBeDefined()
      })
    })
  })
})
