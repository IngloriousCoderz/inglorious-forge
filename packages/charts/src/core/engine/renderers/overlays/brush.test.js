import { describe, expect, it, vi } from "vitest"

import { getBrushRangeAfterDrag, renderBrush } from "./brush.js"

describe("brush renderer", () => {
  it("moves the selection window when panning", () => {
    const nextRange = getBrushRangeAfterDrag({
      startIndex: 2,
      endIndex: 5,
      action: "pan",
      deltaX: 40,
      brushAreaWidth: 80,
      dataLength: 9,
    })

    expect(nextRange).toEqual({
      startIndex: 5,
      endIndex: 8,
    })
  })

  it("clamps left resize before zero", () => {
    const nextRange = getBrushRangeAfterDrag({
      startIndex: 2,
      endIndex: 5,
      action: "resize-left",
      deltaX: -80,
      brushAreaWidth: 80,
      dataLength: 9,
    })

    expect(nextRange).toEqual({
      startIndex: 0,
      endIndex: 5,
    })
  })

  it("clamps right resize after the last index", () => {
    const nextRange = getBrushRangeAfterDrag({
      startIndex: 2,
      endIndex: 5,
      action: "resize-right",
      deltaX: 80,
      brushAreaWidth: 80,
      dataLength: 9,
    })

    expect(nextRange).toEqual({
      startIndex: 2,
      endIndex: 8,
    })
  })

  it("renders drag handlers when the brush is visible", () => {
    const result = renderBrush(
      { props: {} },
      {
        api: { notify() {} },
        entity: {
          id: "brush-chart",
          brush: {
            enabled: true,
            visible: true,
            startIndex: 1,
            endIndex: 3,
            height: 30,
          },
          fullData: [
            { name: "0", value: 10 },
            { name: "1", value: 20 },
            { name: "2", value: 15 },
            { name: "3", value: 30 },
          ],
          seriesKeys: ["value"],
        },
        scales: {
          plottedKeys: ["value"],
        },
        dimensions: {
          plotLeft: 40,
          plotWidth: 320,
          brushTop: 220,
        },
      },
    )

    expect(typeof result.values[9]).toBe("function")
    expect(typeof result.values[13]).toBe("function")
    expect(typeof result.values[17]).toBe("function")
  })

  it("updates the interaction entity and notifies when dragging the selection", () => {
    const interactionEntity = {
      id: "brush-chart",
      brush: {
        enabled: true,
        visible: true,
        startIndex: 1,
        endIndex: 3,
        height: 30,
      },
      data: [
        { name: "0", value: 10 },
        { name: "1", value: 20 },
        { name: "2", value: 15 },
        { name: "3", value: 30 },
        { name: "4", value: 22 },
        { name: "5", value: 28 },
      ],
    }
    const notify = vi.fn()
    const moveListeners = new Map()
    const doc = {
      addEventListener(type, handler) {
        moveListeners.set(type, handler)
      },
      removeEventListener(type) {
        moveListeners.delete(type)
      },
    }
    const result = renderBrush(
      { props: {} },
      {
        api: { notify },
        entity: {
          id: "brush-chart",
          brush: { ...interactionEntity.brush },
          fullData: interactionEntity.data,
          seriesKeys: ["value"],
        },
        interactionEntity,
        scales: { plottedKeys: ["value"] },
        dimensions: {
          plotLeft: 40,
          plotWidth: 320,
          brushTop: 220,
        },
      },
    )

    const onPan = result.values[9]
    onPan({
      clientX: 100,
      currentTarget: {
        closest() {
          return {
            getBoundingClientRect() {
              return { left: 0 }
            },
          }
        },
      },
      preventDefault() {},
      stopPropagation() {},
      view: { document: doc },
    })

    moveListeners.get("mousemove")({ clientX: 220 })

    expect(interactionEntity.brush.startIndex).toBeGreaterThan(1)
    expect(interactionEntity.brush.endIndex).toBeGreaterThan(3)
    expect(notify).toHaveBeenCalledWith("#brush-chart:update")
  })

  it("hydrates a missing interaction brush before dragging", () => {
    const interactionEntity = {
      id: "brush-chart",
      data: [
        { name: "0", value: 10 },
        { name: "1", value: 20 },
        { name: "2", value: 15 },
        { name: "3", value: 30 },
      ],
    }
    const notify = vi.fn()
    const moveListeners = new Map()
    const doc = {
      addEventListener(type, handler) {
        moveListeners.set(type, handler)
      },
      removeEventListener(type) {
        moveListeners.delete(type)
      },
    }
    const result = renderBrush(
      { props: {} },
      {
        api: { notify },
        entity: {
          id: "brush-chart",
          brush: {
            enabled: true,
            visible: true,
            startIndex: 0,
            endIndex: 2,
            height: 30,
          },
          fullData: interactionEntity.data,
          seriesKeys: ["value"],
        },
        interactionEntity,
        scales: { plottedKeys: ["value"] },
        dimensions: {
          plotLeft: 40,
          plotWidth: 320,
          brushTop: 220,
        },
      },
    )

    const onPan = result.values[9]
    onPan({
      clientX: 100,
      currentTarget: {
        closest() {
          return {
            getBoundingClientRect() {
              return { left: 0 }
            },
          }
        },
      },
      preventDefault() {},
      stopPropagation() {},
      view: { document: doc },
    })

    moveListeners.get("mousemove")({ clientX: 160 })

    expect(interactionEntity.brush.startIndex).toBeGreaterThanOrEqual(0)
    expect(interactionEntity.brush.endIndex).toBeGreaterThan(2)
    expect(notify).toHaveBeenCalledWith("#brush-chart:update")
  })
})
