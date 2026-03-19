import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { withRealtime } from "./with-realtime.js"

describe("withRealtime", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("seeds realtime data and hides the brush while the stream is live", () => {
    const type = withRealtime({
      create(entity) {
        entity.data ??= []
      },
    })
    const entity = {
      id: "chart-a",
      type: "line",
      realtime: { enabled: true, visibleWindow: 4, currentValue: 7 },
      data: [],
    }

    type.create(entity)

    expect(entity.data).toEqual([
      { name: "0", value: 7 },
      { name: "1", value: 7 },
      { name: "2", value: 7 },
      { name: "3", value: 7 },
    ])
    expect(entity.brush.visible).toBe(false)
    expect(entity.brush.startIndex).toBe(0)
    expect(entity.brush.endIndex).toBe(3)
  })

  it("shows the brush on pause and hides it again on play", () => {
    const type = withRealtime({
      create(entity) {
        entity.data ??= []
      },
    })
    const entity = {
      id: "chart-b",
      type: "line",
      realtime: { enabled: true, visibleWindow: 3 },
      data: [],
    }

    type.create(entity)
    type.streamPause(entity)

    expect(entity.realtime.paused).toBe(true)
    expect(entity.brush.visible).toBe(true)

    type.streamPlay(entity)

    expect(entity.realtime.paused).toBe(false)
    expect(entity.brush.visible).toBe(false)
  })

  it("advances the stream only after the realtime interval elapses", () => {
    vi.spyOn(Math, "random").mockReturnValue(1)

    const type = withRealtime({
      create(entity) {
        entity.data ??= []
      },
    })
    const entity = {
      id: "chart-c",
      type: "line",
      realtime: {
        enabled: true,
        visibleWindow: 2,
        intervalMs: 1000,
        currentValue: 100,
        variation: 10,
        maxHistory: 10,
      },
      data: [],
    }

    type.create(entity)
    type.streamTick(entity)
    const firstIndex = entity.streamIndex

    type.streamTick(entity)
    expect(entity.streamIndex).toBe(firstIndex)

    vi.setSystemTime(new Date("2026-01-01T00:00:01.001Z"))
    type.streamTick(entity)

    expect(entity.streamIndex).toBe(firstIndex + 1)
    expect(entity.realtime.currentValue).toBe(120)
  })
})
