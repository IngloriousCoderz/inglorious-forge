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
    const frame = createFrameFromEntity(
      {
        id: "chart",
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
      },
      { notify() {} },
    )

    expect(
      frame.primitives.some((primitive) => primitive.type === "brush"),
    ).toBe(false)
    expect(frame.dimensions.brushHeight).toBe(0)
    expect(frame.dimensions.brushTop).toBe(null)
  })

  it("includes brush defaults and layout when brush is visible", () => {
    const frame = createFrameFromEntity(
      {
        id: "chart",
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
      },
      { notify() {} },
    )

    expect(
      frame.primitives.some((primitive) => primitive.type === "brush"),
    ).toBe(true)
    expect(frame.dimensions.brushHeight).toBeGreaterThan(0)
    expect(frame.dimensions.brushTop).not.toBe(null)
  })

  it("gives a composition's brush a full window, without writing to the entity", () => {
    const entity = Object.freeze({
      id: "chart",
      type: "line",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
        { name: "Mar", value: 15 },
      ],
      width: 800,
      height: 400,
    })
    const api = { notify() {}, getEntity: () => entity }

    const frame = createFrameFromRender(
      { entity: "chart", children: [{ type: "brush", props: {} }] },
      api,
    )

    expect(frame.entityId).toBe("chart")
    expect(frame.entity.brush).toEqual({
      enabled: true,
      height: 30,
      startIndex: 0,
      endIndex: 2,
      visible: true,
    })
    expect(entity.brush).toBeUndefined()
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

  it("lays out a chart that has no size, as one rendered without create", () => {
    const frame = createFrameFromEntity({
      type: "Line",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
    })

    expect(frame.entity.width).toBe(800)
    expect(frame.entity.height).toBe(400)
    expect(Object.values(frame.entity.padding).every(Number.isFinite)).toBe(
      true,
    )
    expect(Number.isFinite(frame.dimensions.plotWidth)).toBe(true)
  })

  it("keeps a pie's own value and label fields", () => {
    const frame = createFrameFromEntity({
      type: "Pie",
      width: 400,
      height: 400,
      dataKey: "amount",
      nameKey: "fruit",
      data: [
        { fruit: "Apples", amount: 3 },
        { fruit: "Pears", amount: 1 },
      ],
    })

    expect(frame.entity.data).toEqual([
      { fruit: "Apples", amount: 3 },
      { fruit: "Pears", amount: 1 },
    ])
  })

  it("places rows that share a label at their own positions", () => {
    const frame = createFrameFromEntity({
      type: "Line",
      width: 800,
      height: 400,
      dataKeys: ["value"],
      data: [
        { name: "Mon", value: 1 },
        { name: "Mon", value: 5 },
        { name: "Tue", value: 2 },
      ],
    })
    const xs = frame.entity.data.map((row, index) => frame.scales.xScale(index))

    expect(new Set(xs).size).toBe(3)
  })
})
