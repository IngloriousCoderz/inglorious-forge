import { scaleBand } from "d3-scale"
import { describe, expect, it } from "vitest"

import {
  bandCenter,
  createSeriesPoints,
  getBarGroupWidth,
  getCategoryX,
  getTooltipBindings,
  getTooltipText,
  maximumValue,
  minimumValue,
  resolveLegendItems,
  resolveSeriesColor,
} from "./shared.js"

function createBaseFrame() {
  const xScale = scaleBand().domain([0, 1]).range([0, 200]).padding(0)

  return {
    entity: {
      xKey: "name",
      seriesKeys: ["revenue", "cost"],
      colors: ["#2563eb", "#f97316"],
      isTooltipEnabled: true,
      data: [
        { name: "Jan", revenue: 10, cost: 4 },
        { name: "Feb", revenue: 16, cost: 8 },
      ],
    },
    primitives: [],
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

describe("shared render helpers", () => {
  it("computes band centers and category positions", () => {
    const xScale = scaleBand().domain([0]).range([0, 100]).padding(0)

    expect(bandCenter(10, 20)).toBe(20)
    expect(getCategoryX({ xScale }, 0)).toBe(50)
  })

  it("returns band width for bar groups when using a band scale", () => {
    const frame = createBaseFrame()

    expect(getBarGroupWidth(frame)).toBe(100)
  })

  it("falls back to point step and plot width for bar groups", () => {
    expect(
      getBarGroupWidth({
        scales: {
          xScaleMode: "point",
          xScale: {
            step() {
              return 50
            },
          },
        },
        dimensions: { plotWidth: 200 },
        entity: { data: [{}, {}] },
      }),
    ).toBe(30)

    expect(
      getBarGroupWidth({
        scales: {
          xScaleMode: "point",
          xScale: {},
        },
        dimensions: { plotWidth: 240 },
        entity: { data: [{}, {}, {}] },
      }),
    ).toBe(80)
  })

  it("resolves series colors and legend items", () => {
    const frame = createBaseFrame()

    expect(resolveSeriesColor(frame, "cost")).toBe("#f97316")
    expect(resolveLegendItems({ props: {} }, frame)).toEqual([
      { label: "revenue", color: "#2563eb" },
      { label: "cost", color: "#f97316" },
    ])
  })

  it("uses a native <title> as tooltip on a chart without an entity", () => {
    const frame = { ...createBaseFrame(), entityId: null }
    const text = getTooltipText(frame, { name: "Jan", revenue: 10 }, "revenue")

    const enabled = getTooltipBindings(frame, { props: {} }, { index: 0 }, text)
    frame.entity = { ...frame.entity, isTooltipEnabled: false }
    const disabled = getTooltipBindings(
      frame,
      { props: {} },
      { index: 0 },
      text,
    )

    const titleMarkup = enabled.title.values[0].values[0]
    expect(titleMarkup).toBe("<title>Jan: 10</title>")
    expect(enabled.onEnter).toBeUndefined()
    expect(disabled).toEqual({ title: "" })
  })

  it("creates stacked series points for area stacks", () => {
    const frame = createBaseFrame()
    frame.primitives = [
      { type: "area", props: { dataKey: "revenue", stackId: "sales" } },
      { type: "area", props: { dataKey: "cost", stackId: "sales" } },
    ]

    const points = createSeriesPoints(
      { type: "area", props: { dataKey: "cost", stackId: "sales" } },
      frame,
    )

    expect(points[0].x).toBe(50)
    expect(points[0].y0).toBe(100)
    expect(points[0].y).toBe(60)
  })

  it("finds maximum and minimum values", () => {
    const rows = [{ value: 10 }, { value: 3 }, { value: 18 }]

    expect(maximumValue(rows, "value")).toBe(18)
    expect(minimumValue(rows, "value")).toBe(3)
  })

  it("leaves a gap for a missing value instead of drawing zero", () => {
    const frame = createBaseFrame()
    frame.entity.data = [{ name: "Jan", revenue: 10 }, { name: "Feb" }]

    const points = createSeriesPoints({ props: { dataKey: "revenue" } }, frame)

    expect(Number.isFinite(points[0].y)).toBe(true)
    expect(points[1].y).toBeNaN()
  })

  it("places points by row, so rows sharing a label stay apart", () => {
    const frame = createBaseFrame()
    frame.entity.data = [
      { name: "Mon", revenue: 1 },
      { name: "Mon", revenue: 2 },
    ]

    const points = createSeriesPoints({ props: { dataKey: "revenue" } }, frame)

    expect(points[0].x).not.toBe(points[1].x)
  })
})
