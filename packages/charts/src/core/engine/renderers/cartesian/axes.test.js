import { scaleBand } from "d3-scale"
import { describe, expect, it } from "vitest"

import { renderCartesianGrid, renderXAxis, renderYAxis } from "./axes.js"

function createFrame() {
  const xScale = scaleBand().domain(["Jan", "Feb"]).range([0, 200]).padding(0)

  return {
    entity: {
      xKey: "name",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
    },
    scales: {
      xScale,
      yScale(value) {
        return 200 - value * 10
      },
    },
    dimensions: {
      plotLeft: 40,
      plotRight: 240,
      plotTop: 20,
      plotBottom: 200,
    },
  }
}

describe("axes renderers", () => {
  it("renders cartesian grid with domain and tick lines", () => {
    const frame = createFrame()
    frame.scales.yScale.ticks = () => [0, 10, 20]

    const result = renderCartesianGrid({ props: {} }, frame)
    const items = result.values.filter(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-grid")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveLength(2)
    expect(items[1]).toHaveLength(3)
  })

  it("renders x-axis labels from entity data", () => {
    const result = renderXAxis({ props: { dataKey: "name" } }, createFrame())

    const labels = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-axis-x")
    expect(labels).toHaveLength(2)
  })

  it("renders y-axis ticks", () => {
    const frame = createFrame()
    frame.scales.yScale.ticks = () => [0, 10, 20]

    const result = renderYAxis({ props: {} }, frame)
    const labels = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-axis-y")
    expect(labels).toHaveLength(3)
  })
})
