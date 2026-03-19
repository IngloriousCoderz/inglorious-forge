import { describe, expect, it } from "vitest"

import {
  brushChange,
  create,
  dataUpdate,
  sizeUpdate,
} from "./chart-handlers.js"

describe("chart handlers", () => {
  it("creates default chart state", () => {
    const entity = { type: "line" }

    create(entity)

    expect(entity.width).toBe(800)
    expect(entity.height).toBe(400)
    expect(entity.data).toEqual([])
    expect(entity.showGrid).toBe(true)
    expect(entity.showLegend).toBe(false)
    expect(entity.showTooltip).toBe(true)
    expect(entity.colors.length).toBeGreaterThan(0)
  })

  it("preserves existing values during create", () => {
    const entity = {
      type: "line",
      width: 900,
      height: 320,
      data: [{ name: "Jan", value: 10 }],
      showLegend: true,
    }

    create(entity)

    expect(entity.width).toBe(900)
    expect(entity.height).toBe(320)
    expect(entity.data).toEqual([{ name: "Jan", value: 10 }])
    expect(entity.showLegend).toBe(true)
  })

  it("initializes brush defaults during create", () => {
    const entity = {
      type: "line",
      data: [
        { name: "Jan", value: 10 },
        { name: "Feb", value: 20 },
      ],
      brush: { enabled: true },
    }

    create(entity)

    expect(entity.brush.height).toBe(30)
    expect(entity.brush.startIndex).toBe(0)
    expect(entity.brush.endIndex).toBe(1)
    expect(entity.brush.visible).toBe(true)
  })

  it("updates data with array values and resets to empty array otherwise", () => {
    const entity = { type: "line", data: [] }

    dataUpdate(entity, [{ name: "Jan", value: 10 }])
    expect(entity.data).toEqual([{ name: "Jan", value: 10 }])

    dataUpdate(entity, null)
    expect(entity.data).toEqual([])
  })

  it("updates size using payload values and keeps existing values as fallback", () => {
    const entity = { type: "line", width: 400, height: 200 }

    sizeUpdate(entity, { width: 900 })
    expect(entity.width).toBe(900)
    expect(entity.height).toBe(200)
  })

  it("creates and clamps brush ranges safely", () => {
    const entity = {
      type: "line",
      data: [{}, {}, {}],
    }

    brushChange(entity, { startIndex: -5, endIndex: 99 })

    expect(entity.brush.enabled).toBe(true)
    expect(entity.brush.height).toBe(30)
    expect(entity.brush.startIndex).toBe(0)
    expect(entity.brush.endIndex).toBe(2)
  })

  it("keeps brush endIndex greater than or equal to startIndex", () => {
    const entity = {
      type: "line",
      data: [{}, {}, {}, {}],
      brush: { enabled: true, height: 30 },
    }

    brushChange(entity, { startIndex: 3, endIndex: 1 })

    expect(entity.brush.startIndex).toBe(3)
    expect(entity.brush.endIndex).toBe(3)
  })
})
