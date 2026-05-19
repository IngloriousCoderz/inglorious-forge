import { describe, expect, it } from "vitest"

import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Dots,
  Legend,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "./factories.js"

describe("primitive factories", () => {
  it("creates cartesian infrastructure primitives", () => {
    expect(CartesianGrid({ stroke: "#eee" })).toEqual({
      type: "cartesian-grid",
      props: { stroke: "#eee" },
    })
    expect(XAxis({ dataKey: "name" })).toEqual({
      type: "x-axis",
      props: { dataKey: "name" },
    })
    expect(YAxis({ width: "auto" })).toEqual({
      type: "y-axis",
      props: { width: "auto" },
    })
  })

  it("creates series primitives", () => {
    expect(Line({ dataKey: "value" })).toEqual({
      type: "line",
      props: { dataKey: "value" },
    })
    expect(Area({ dataKey: "value" })).toEqual({
      type: "area",
      props: { dataKey: "value" },
    })
    expect(Bar({ dataKey: "value" })).toEqual({
      type: "bar",
      props: { dataKey: "value" },
    })
    expect(Pie({ dataKey: "value" })).toEqual({
      type: "pie",
      props: { dataKey: "value" },
    })
    expect(Dots({ dataKey: "value" })).toEqual({
      type: "dots",
      props: { dataKey: "value" },
    })
  })

  it("creates overlay primitives", () => {
    expect(Tooltip({})).toEqual({
      type: "tooltip",
      props: {},
    })
    expect(Legend({ dataKeys: ["value"] })).toEqual({
      type: "legend",
      props: { dataKeys: ["value"] },
    })
    expect(Brush({ height: 24 })).toEqual({
      type: "brush",
      props: { height: 24 },
    })
  })
})
