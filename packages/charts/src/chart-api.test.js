import { describe, expect, it } from "vitest"

import { chart, lineChart } from "./index.js"

describe("charts public api", () => {
  it("exposes pure component factories on the chart namespace", () => {
    expect(chart.Line({ dataKey: "value" })).toEqual({
      type: "LINE",
      props: { dataKey: "value" },
    })
    expect(chart.XAxis({ dataKey: "name" })).toEqual({
      type: "X_AXIS",
      props: { dataKey: "name" },
    })
  })

  it("renders composition charts as svg templates", () => {
    const result = chart.render(
      {
        type: "line",
        data: [
          { name: "Jan", value: 10 },
          { name: "Feb", value: 20 },
        ],
      },
      {
        width: 800,
        height: 400,
        children: [
          chart.CartesianGrid(),
          chart.XAxis({ dataKey: "name" }),
          chart.YAxis(),
          chart.Line({ dataKey: "value" }),
        ],
      },
      {},
    )

    expect(result.strings.join("")).toContain("<svg")
    expect(result.values[4]).toBe("inline-chart-line-anonymous")
  })

  it("renders store-style chart types through the same core engine", () => {
    const entity = {
      id: "sales-line",
      type: "line",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
      width: 800,
      height: 400,
      showGrid: true,
      showTooltip: true,
    }

    const result = lineChart.render(entity, {})

    expect(result.strings.join("")).toContain("<svg")
    expect(result.values[4]).toBe("sales-line")
  })

  it("supports the shorthand composition signature with source and api only", () => {
    const api = {
      getEntity() {},
      getType() {},
    }
    const result = chart.render(
      {
        type: "pie",
        data: [{ label: "A", value: 10 }],
      },
      api,
    )

    expect(result.strings.join("")).toContain("<svg")
    expect(result.values[4]).toBe("inline-chart-pie-anonymous")
  })
})
