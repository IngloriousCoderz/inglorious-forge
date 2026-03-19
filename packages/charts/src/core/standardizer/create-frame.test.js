import { describe, expect, it } from "vitest"

import { createFrameFromEntity, createFrameFromRender } from "./index.js"

describe("standardizer", () => {
  it("creates a point x-scale for pure line charts", () => {
    const frame = createFrameFromRender({
      type: "line",
      width: 800,
      height: 400,
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 30 },
        { name: "Mar", value: 20 },
      ],
    })

    expect(frame.scales.xScaleMode).toBe("point")
    expect(frame.components.map((component) => component.type)).toContain(
      "LINE",
    )
  })

  it("creates a band x-scale whenever bars are present in composed charts", () => {
    const frame = createFrameFromRender({
      type: "composed",
      width: 800,
      height: 400,
      data: [
        { name: "Jan", revenue: 10, target: 12, forecast: 11 },
        { name: "Feb", revenue: 30, target: 18, forecast: 27 },
      ],
      series: [
        { kind: "area", dataKey: "revenue" },
        { kind: "bar", dataKey: "target" },
        { kind: "line", dataKey: "forecast" },
      ],
    })

    expect(frame.scales.xScaleMode).toBe("band")
  })

  it("hides brush defaults and layout when brush is not visible", () => {
    const frame = createFrameFromEntity({
      type: "line",
      width: 800,
      height: 400,
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
      brush: {
        enabled: true,
        visible: false,
        startIndex: 0,
        endIndex: 1,
      },
    })

    expect(
      frame.components.some((component) => component.type === "BRUSH"),
    ).toBe(false)
    expect(frame.dimensions.brushHeight).toBe(0)
    expect(frame.dimensions.brushTop).toBe(null)
  })

  it("includes brush defaults and layout when brush is visible", () => {
    const frame = createFrameFromEntity({
      type: "line",
      width: 800,
      height: 400,
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
      brush: {
        enabled: true,
        visible: true,
        startIndex: 0,
        endIndex: 1,
      },
    })

    expect(
      frame.components.some((component) => component.type === "BRUSH"),
    ).toBe(true)
    expect(frame.dimensions.brushHeight).toBeGreaterThan(0)
    expect(frame.dimensions.brushTop).not.toBe(null)
  })

  it("hydrates the interaction entity brush for composition charts", () => {
    const source = {
      type: "line",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
        { name: "Mar", value: 15 },
      ],
    }

    const frame = createFrameFromRender(source, {
      width: 800,
      height: 400,
      children: [{ type: "BRUSH", props: {} }],
    })

    expect(frame.interactionEntity.brush).toEqual({
      enabled: true,
      height: 30,
      startIndex: 0,
      endIndex: 2,
      visible: true,
    })
  })
})
