import { describe, expect, it } from "vitest"

import { DEFAULT_PRIMITIVES } from "./default-primitives.js"

describe("default primitives", () => {
  it("builds line defaults with grid, axes, series, legend, tooltip and brush", () => {
    const primitives = DEFAULT_PRIMITIVES.line({
      xKey: "name",
      seriesKeys: ["valueA", "valueB"],
      colors: ["#111111", "#222222"],
      hasGrid: true,
      hasLegend: true,
      hasTooltip: true,
      brush: { enabled: true, visible: true, height: 24 },
    })

    expect(primitives.map((primitive) => primitive.type)).toEqual([
      "cartesian-grid",
      "x-axis",
      "y-axis",
      "line",
      "line",
      "legend",
      "tooltip",
      "brush",
    ])
    expect(primitives[3].props).toMatchObject({
      dataKey: "valueA",
      stroke: "#111111",
      hasDots: true,
    })
  })

  it("builds stacked area defaults with default stack ids", () => {
    const primitives = DEFAULT_PRIMITIVES.area({
      xKey: "name",
      seriesKeys: ["Revenue", "Expenses"],
      colors: ["#111111", "#222222"],
      stacked: true,
      hasTooltip: true,
    })

    const areaPrimitives = primitives.filter(
      (primitive) => primitive.type === "area",
    )
    expect(areaPrimitives).toHaveLength(2)
    expect(areaPrimitives[0].props.stackId).toBe("default-stack")
    expect(areaPrimitives[0].props.fillOpacity).toBe(0.45)
  })

  it("does not include a brush when brush visibility is false", () => {
    const primitives = DEFAULT_PRIMITIVES.bar({
      xKey: "name",
      seriesKeys: ["value"],
      colors: ["#111111"],
      brush: { enabled: true, visible: false },
    })

    expect(primitives.some((primitive) => primitive.type === "brush")).toBe(
      false,
    )
  })

  it("builds pie and donut defaults with tooltip support", () => {
    const piePrimitives = DEFAULT_PRIMITIVES.pie({
      dataKey: "amount",
      nameKey: "category",
      hasTooltip: true,
    })
    const donutPrimitives = DEFAULT_PRIMITIVES.donut({
      dataKey: "amount",
      nameKey: "category",
      hasTooltip: true,
    })

    expect(piePrimitives[0]).toMatchObject({
      type: "pie",
      props: {
        dataKey: "amount",
        nameKey: "category",
      },
    })
    expect(donutPrimitives[0].props.innerRadius).toBe("55%")
    expect(piePrimitives.at(-1).type).toBe("tooltip")
    expect(donutPrimitives.at(-1).type).toBe("tooltip")
  })

  it("maps composed series kinds to their matching primitive types", () => {
    const primitives = DEFAULT_PRIMITIVES.composed({
      xKey: "name",
      colors: ["#111111", "#222222", "#333333"],
      series: [
        { kind: "area", dataKey: "revenue" },
        { kind: "bar", dataKey: "target" },
        { kind: "line", dataKey: "forecast" },
      ],
      seriesKeys: ["revenue", "target", "forecast"],
      hasTooltip: true,
    })

    expect(primitives.map((primitive) => primitive.type)).toEqual([
      "cartesian-grid",
      "x-axis",
      "y-axis",
      "area",
      "bar",
      "line",
      "legend",
      "tooltip",
    ])
  })
})
