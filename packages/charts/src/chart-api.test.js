import { describe, expect, it } from "vitest"

import { Chart } from "./index.js"

describe("charts public api", () => {
  it("exposes pure primitive factories on the Chart namespace", () => {
    expect(Chart.Line({ dataKey: "value" })).toEqual({
      type: "line",
      props: { dataKey: "value" },
    })
    expect(Chart.XAxis({ dataKey: "name" })).toEqual({
      type: "x-axis",
      props: { dataKey: "name" },
    })
  })

  it("renders composition charts as svg templates", () => {
    const result = Chart.render(
      {
        type: "line",
        data: [
          { name: "Jan", value: 10 },
          { name: "Feb", value: 20 },
        ],
        width: 800,
        height: 400,
        children: [
          Chart.CartesianGrid(),
          Chart.XAxis({ dataKey: "name" }),
          Chart.YAxis(),
          Chart.Line({ dataKey: "value" }),
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

    const result = Chart.render(entity, {})

    expect(result.strings.join("")).toContain("<svg")
    expect(result.values[4]).toBe("sales-line")
  })

  it("supports the shorthand composition signature with source and api only", () => {
    const api = {
      getEntity() {},
      getType() {},
    }
    const result = Chart.render(
      {
        type: "pie",
        data: [{ label: "A", value: 10 }],
        children: [Chart.Pie({ dataKey: "value", nameKey: "label" })],
      },
      api,
    )

    expect(result.strings.join("")).toContain("<svg")
    expect(result.values[4]).toBe("inline-chart-pie-anonymous")
  })

  it("exposes create/render on Chart for createStore (config mode)", () => {
    expect(typeof Chart.render).toBe("function")
    expect(typeof Chart.create).toBe("function")
  })
})
