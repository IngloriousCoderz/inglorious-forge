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
    const handlers = getDragHandlers(renderBrush({ props: {} }, createFrame()))

    expect(handlers).toHaveLength(3)
  })

  it("dispatches brushChange to the entity while dragging, writing nothing", () => {
    const notify = vi.fn()
    const frame = createFrame(notify)
    const [onPan] = getDragHandlers(renderBrush({ props: {} }, frame))
    const brushBefore = { ...frame.entity.brush }
    const doc = startDrag(onPan, 100)

    doc.move(220)
    doc.move(220)

    expect(notify).toHaveBeenCalledTimes(1)
    const [event, range] = notify.mock.calls[0]
    expect(event).toBe("#brush-chart:brushChange")
    expect(range.startIndex).toBeGreaterThan(1)
    expect(range.endIndex).toBeGreaterThan(3)
    expect(frame.entity.brush).toEqual(brushBefore)
  })

  it("stops dispatching once the mouse is released", () => {
    const notify = vi.fn()
    const [onPan] = getDragHandlers(
      renderBrush({ props: {} }, createFrame(notify)),
    )
    const doc = startDrag(onPan, 100)

    doc.release()

    expect(doc.listeners.size).toBe(0)
    expect(notify).not.toHaveBeenCalled()
  })
})

function createFrame(notify = () => {}) {
  return {
    api: { notify },
    entityId: "brush-chart",
    entity: {
      brush: {
        enabled: true,
        visible: true,
        startIndex: 1,
        endIndex: 3,
        height: 30,
      },
      fullData: [10, 20, 15, 30, 22, 28].map((value, index) => ({
        name: `${index}`,
        value,
      })),
      seriesKeys: ["value"],
    },
    scales: { plottedKeys: ["value"] },
    dimensions: { plotLeft: 40, plotWidth: 320, brushTop: 220 },
  }
}

// The pan, resize-left and resize-right handlers, in that order.
function getDragHandlers(template) {
  return template.values.filter((value) => typeof value === "function")
}

function startDrag(onMouseDown, clientX) {
  const listeners = new Map()
  const doc = {
    listeners,
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
    move: (x) => listeners.get("mousemove")({ clientX: x }),
    release: () => listeners.get("mouseup")(),
  }
  onMouseDown({
    clientX,
    currentTarget: {
      closest: () => ({ getBoundingClientRect: () => ({ left: 0 }) }),
    },
    preventDefault() {},
    stopPropagation() {},
    view: { document: doc },
  })
  return doc
}
