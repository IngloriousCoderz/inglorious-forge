import { scaleBand } from "d3-scale"
import { describe, expect, it } from "vitest"

import {
  renderAreaSeries,
  renderBarSeries,
  renderDots,
  renderLineSeries,
} from "./index.js"

function createFrame() {
  const xScale = scaleBand().domain(["Jan", "Feb"]).range([0, 200]).padding(0)

  return {
    entity: {
      xKey: "name",
      seriesKeys: ["revenue", "cost"],
      colors: ["#2563eb", "#f97316"],
      tooltipEnabled: true,
      data: [
        { name: "Jan", revenue: 10, cost: 4 },
        { name: "Feb", revenue: 16, cost: 8 },
      ],
    },
    components: [
      { type: "bar", props: { dataKey: "revenue" } },
      { type: "bar", props: { dataKey: "cost" } },
    ],
    scales: {
      xScale,
      xScaleMode: "band",
      plottedKeys: ["revenue", "cost"],
      yScale(value) {
        return 200 - value * 10
      },
    },
    dimensions: {
      plotWidth: 200,
    },
  }
}

describe("cartesian renderers", () => {
  it("renders a line path and optional dots", () => {
    const result = renderLineSeries(
      {
        props: {
          dataKey: "revenue",
          showDots: true,
        },
      },
      createFrame(),
    )

    expect(String(result.strings.join(""))).toContain("iw-chart-line")
    expect(result.values.some((value) => typeof value === "string")).toBe(true)
  })

  it("renders an area fill and stroke", () => {
    const result = renderAreaSeries(
      {
        props: {
          dataKey: "revenue",
          fill: "#2563eb",
        },
      },
      createFrame(),
    )

    expect(String(result.strings.join(""))).toContain("iw-chart-area")
    expect(result.values).toContain("#2563eb")
  })

  it("renders bars for each row", () => {
    const result = renderBarSeries(
      {
        type: "bar",
        props: {
          dataKey: "revenue",
        },
      },
      createFrame(),
    )

    const rects = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-bar")
    expect(rects).toHaveLength(2)
  })

  it("renders dots for each series point", () => {
    const result = renderDots(
      {
        props: {
          dataKey: "revenue",
          fill: "#2563eb",
        },
      },
      createFrame(),
    )

    const circles = result.values.find(Array.isArray)

    expect(String(result.strings.join(""))).toContain("iw-chart-dots")
    expect(circles).toHaveLength(2)
  })
})
