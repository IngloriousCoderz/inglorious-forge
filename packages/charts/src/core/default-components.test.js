import { describe, expect, it } from "vitest"

import { DEFAULT_COMPONENTS } from "./default-components.js"

describe("default components", () => {
  it("builds line defaults with grid, axes, series, legend, tooltip and brush", () => {
    const components = DEFAULT_COMPONENTS.line({
      xKey: "name",
      seriesKeys: ["valueA", "valueB"],
      colors: ["#111111", "#222222"],
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      brush: { enabled: true, visible: true, height: 24 },
    })

    expect(components.map((component) => component.type)).toEqual([
      "cartesian-grid",
      "x-axis",
      "y-axis",
      "line",
      "line",
      "legend",
      "tooltip",
      "brush",
    ])
    expect(components[3].props).toMatchObject({
      dataKey: "valueA",
      stroke: "#111111",
      showDots: true,
    })
  })

  it("builds stacked area defaults with default stack ids", () => {
    const components = DEFAULT_COMPONENTS.area({
      xKey: "name",
      seriesKeys: ["Revenue", "Expenses"],
      colors: ["#111111", "#222222"],
      stacked: true,
      showTooltip: true,
    })

    const areaComponents = components.filter(
      (component) => component.type === "area",
    )
    expect(areaComponents).toHaveLength(2)
    expect(areaComponents[0].props.stackId).toBe("default-stack")
    expect(areaComponents[0].props.fillOpacity).toBe(0.45)
  })

  it("does not include a brush when brush visibility is false", () => {
    const components = DEFAULT_COMPONENTS.bar({
      xKey: "name",
      seriesKeys: ["value"],
      colors: ["#111111"],
      brush: { enabled: true, visible: false },
    })

    expect(components.some((component) => component.type === "brush")).toBe(
      false,
    )
  })

  it("builds pie and donut defaults with tooltip support", () => {
    const pieComponents = DEFAULT_COMPONENTS.pie({
      dataKey: "amount",
      nameKey: "category",
      showTooltip: true,
    })
    const donutComponents = DEFAULT_COMPONENTS.donut({
      dataKey: "amount",
      nameKey: "category",
      showTooltip: true,
    })

    expect(pieComponents[0]).toMatchObject({
      type: "pie",
      props: {
        dataKey: "amount",
        nameKey: "category",
      },
    })
    expect(donutComponents[0].props.innerRadius).toBe("55%")
    expect(pieComponents.at(-1).type).toBe("tooltip")
    expect(donutComponents.at(-1).type).toBe("tooltip")
  })

  it("maps composed series kinds to their matching component types", () => {
    const components = DEFAULT_COMPONENTS.composed({
      xKey: "name",
      colors: ["#111111", "#222222", "#333333"],
      series: [
        { kind: "area", dataKey: "revenue" },
        { kind: "bar", dataKey: "target" },
        { kind: "line", dataKey: "forecast" },
      ],
      seriesKeys: ["revenue", "target", "forecast"],
      showTooltip: true,
    })

    expect(components.map((component) => component.type)).toEqual([
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
