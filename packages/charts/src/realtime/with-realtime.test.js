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

  it("should initialize seed data when realtime is enabled and data is empty", () => {
    const baseType = {
      create: vi.fn((entity) => {
        entity.data ??= []
      }),
    }
    const type = withRealtime(baseType)
    const entity = {
      type: "line",
      realtime: { enabled: true, visibleWindow: 4, currentValue: 7 },
      data: [],
    }

    type.create(entity)

    expect(baseType.create).toHaveBeenCalledTimes(1)
    expect(entity.data).toEqual([
      { name: "0", value: 7 },
      { name: "1", value: 7 },
      { name: "2", value: 7 },
      { name: "3", value: 7 },
    ])
    expect(entity.streamIndex).toBe(3)
  })

  it("should update stream data when interval has elapsed", () => {
    vi.spyOn(Math, "random").mockReturnValue(1)

    const type = withRealtime({
      create(entity) {
        entity.data ??= []
      },
    })
    const entity = {
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
    const firstLength = entity.data.length

    // Same clock instant: should be gated by intervalMs.
    type.streamTick(entity)
    expect(entity.streamIndex).toBe(firstIndex)
    expect(entity.data.length).toBe(firstLength)

    vi.setSystemTime(new Date("2026-01-01T00:00:01.001Z"))
    type.streamTick(entity)

    expect(entity.streamIndex).toBe(firstIndex + 1)
    expect(entity.realtime.currentValue).toBe(120)
    expect(entity.data.at(-1)).toEqual({
      name: `${firstIndex + 1}`,
      value: 120,
    })
  })

  it("should set paused state and toggle brush visibility on streamPause and streamPlay", () => {
    const type = withRealtime({
      create(entity) {
        entity.data ??= []
      },
    })
    const entity = {
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
    expect(entity.brush.startIndex).toBeGreaterThanOrEqual(0)
    expect(entity.brush.endIndex).toBeGreaterThanOrEqual(0)
  })
})
