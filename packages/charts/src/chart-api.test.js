import { describe, expect, it } from "vitest"

import { chart, lineChart } from "./index.js"

function resolveChartType(chartTypeDef) {
  // `lineChart` is exported as an array so store-style composition (mixins) works.
  // Tests call `.render` directly, so we compose the type here for the assertion.
  if (!Array.isArray(chartTypeDef)) return chartTypeDef

  return chartTypeDef.reduce((acc, behavior) => {
    const applied =
      typeof behavior === "function" ? behavior(acc) : (behavior ?? {})
    return { ...acc, ...applied }
  }, {})
}

describe("charts public api", () => {
  it("exposes pure primitive factories on the chart namespace", () => {
    expect(chart.Line({ dataKey: "value" })).toEqual({
      type: "line",
      props: { dataKey: "value" },
    })
    expect(chart.XAxis({ dataKey: "name" })).toEqual({
      type: "x-axis",
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
      hasGrid: true,
      hasTooltip: true,
    }

    const type = resolveChartType(lineChart)
    const result = type.render(entity, {})

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
        children: [chart.Pie({ dataKey: "value", nameKey: "label" })],
      },
      api,
    )

    expect(result.strings.join("")).toContain("<svg")
    expect(result.values[4]).toBe("inline-chart-pie-anonymous")
  })
})
