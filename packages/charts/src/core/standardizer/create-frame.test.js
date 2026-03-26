import { describe, expect, it } from "vitest"

import { createFrameFromEntity, createFrameFromRender } from "./index.js"

describe("standardizer", () => {
  it("throws on composition renders when children are missing", () => {
    expect(() =>
      createFrameFromRender({
        type: "line",
        width: 800,
        height: 400,
        data: [
          { name: "Jan", value: 10 },
          { name: "Feb", value: 20 },
        ],
      }),
    ).toThrow(/requires 'children' with primitives\./)
  })

  it("throws on composition renders when children are empty", () => {
    expect(() =>
      createFrameFromRender({
        type: "line",
        width: 800,
        height: 400,
        data: [
          { name: "Jan", value: 10 },
          { name: "Feb", value: 20 },
        ],
        children: [],
      }),
    ).toThrow(/requires 'children' with primitives\./)
  })

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
      children: [{ type: "line", props: { dataKey: "value" } }],
    })

    expect(frame.scales.xScaleMode).toBe("point")
    expect(frame.primitives.map((primitive) => primitive.type)).toContain(
      "line",
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
      children: [
        { type: "area", props: { dataKey: "revenue" } },
        { type: "bar", props: { dataKey: "target" } },
        { type: "line", props: { dataKey: "forecast" } },
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
      frame.primitives.some((primitive) => primitive.type === "brush"),
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
      frame.primitives.some((primitive) => primitive.type === "brush"),
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
      width: 800,
      height: 400,
      children: [{ type: "brush", props: {} }],
    }

    const frame = createFrameFromRender(source)

    expect(frame.interactionEntity.brush).toEqual({
      enabled: true,
      height: 30,
      startIndex: 0,
      endIndex: 2,
      visible: true,
    })
  })

  it("uses pie primitive radii for composition donut charts", () => {
    const frame = createFrameFromRender({
      type: "donut",
      width: 500,
      height: 400,
      data: [
        { name: "A", value: 20 },
        { name: "B", value: 35 },
      ],
      children: [
        {
          type: "pie",
          props: {
            dataKey: "value",
            nameKey: "name",
            outerRadius: 140,
            innerRadius: 84,
          },
        },
      ],
    })

    expect(frame.scales.outerRadius).toBe(140)
    expect(frame.scales.innerRadius).toBe(84)
  })
})
