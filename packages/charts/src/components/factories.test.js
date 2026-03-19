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

describe("component factories", () => {
  it("creates cartesian infrastructure components", () => {
    expect(CartesianGrid({ stroke: "#eee" })).toEqual({
      type: "CARTESIAN_GRID",
      props: { stroke: "#eee" },
    })
    expect(XAxis({ dataKey: "name" })).toEqual({
      type: "X_AXIS",
      props: { dataKey: "name" },
    })
    expect(YAxis({ width: "auto" })).toEqual({
      type: "Y_AXIS",
      props: { width: "auto" },
    })
  })

  it("creates series components", () => {
    expect(Line({ dataKey: "value" })).toEqual({
      type: "LINE",
      props: { dataKey: "value" },
    })
    expect(Area({ dataKey: "value" })).toEqual({
      type: "AREA",
      props: { dataKey: "value" },
    })
    expect(Bar({ dataKey: "value" })).toEqual({
      type: "BAR",
      props: { dataKey: "value" },
    })
    expect(Pie({ dataKey: "value" })).toEqual({
      type: "PIE",
      props: { dataKey: "value" },
    })
    expect(Dots({ dataKey: "value" })).toEqual({
      type: "DOTS",
      props: { dataKey: "value" },
    })
  })

  it("creates overlay components", () => {
    expect(Tooltip({})).toEqual({
      type: "TOOLTIP",
      props: {},
    })
    expect(Legend({ dataKeys: ["value"] })).toEqual({
      type: "LEGEND",
      props: { dataKeys: ["value"] },
    })
    expect(Brush({ height: 24 })).toEqual({
      type: "BRUSH",
      props: { height: 24 },
    })
  })
})
