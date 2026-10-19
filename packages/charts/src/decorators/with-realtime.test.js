import { describe, expect, it } from "vitest"

import { Chart } from "../index.js"
import { withRealtime } from "./with-realtime.js"

function createLiveChart(realtime = {}) {
  const type = withRealtime(Chart)
  const entity = { id: "live", type: "Line", realtime }
  type.create(entity)
  return { type, entity }
}

describe("withRealtime", () => {
  it("starts empty and live, with the brush hidden", () => {
    const { entity } = createLiveChart()

    expect(entity.data).toEqual([])
    expect(entity.realtime).toEqual({
      visibleWindow: 30,
      maxHistory: 2000,
      isPaused: false,
      pending: [],
    })
    expect(entity.brush.enabled).toBe(true)
    expect(entity.brush.visible).toBe(false)
  })

  it("adds pushed values and follows the newest ones", () => {
    const { type, entity } = createLiveChart({ visibleWindow: 2 })

    type.streamPush(entity, 10)
    type.streamPush(entity, 20)
    type.streamPush(entity, 30)

    expect(entity.data.map((point) => point.value)).toEqual([10, 20, 30])
    expect(entity.brush.startIndex).toBe(1)
    expect(entity.brush.endIndex).toBe(2)
  })

  it("adds a pushed point as it is", () => {
    const { type, entity } = createLiveChart()

    type.streamPush(entity, { time: "12:00", value: 5 })

    expect(entity.data).toEqual([{ time: "12:00", value: 5 }])
  })

  it("does not change while paused, keeping pushed points for later", () => {
    const { type, entity } = createLiveChart({ visibleWindow: 2 })
    type.streamPush(entity, 10)
    type.streamPush(entity, 20)

    type.streamPause(entity)
    const pausedData = entity.data
    const pausedBrush = { ...entity.brush }
    type.streamPush(entity, 30)
    type.streamPush(entity, { name: "x", value: 40 })

    expect(entity.data).toBe(pausedData)
    expect(entity.data.map((point) => point.value)).toEqual([10, 20])
    expect(entity.brush).toEqual({ ...pausedBrush, visible: true })
    expect(entity.realtime.pending).toEqual([30, { name: "x", value: 40 }])
  })

  it("adds the points pushed while paused on play, and follows the newest", () => {
    const { type, entity } = createLiveChart({ visibleWindow: 2 })
    type.streamPush(entity, 10)
    type.streamPause(entity)
    type.streamPush(entity, 20)
    type.streamPush(entity, 30)

    type.streamPlay(entity)

    expect(entity.data.map((point) => point.value)).toEqual([10, 20, 30])
    expect(entity.realtime.pending).toEqual([])
    expect(entity.brush.visible).toBe(false)
    expect([entity.brush.startIndex, entity.brush.endIndex]).toEqual([1, 2])
  })

  it("keeps at most maxHistory points waiting while paused", () => {
    const { type, entity } = createLiveChart({ maxHistory: 2 })
    type.streamPause(entity)

    type.streamPush(entity, 1)
    type.streamPush(entity, 2)
    type.streamPush(entity, 3)

    expect(entity.realtime.pending).toEqual([2, 3])
  })

  it("runs no timers of its own", () => {
    const { type } = createLiveChart()

    expect(type.streamTick).toBeUndefined()
    expect(type.destroy).toBe(Chart.destroy)
  })
})
