import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createRealtimeStreamSystem } from "./realtime-stream.js"

describe("createRealtimeStreamSystem", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("should notify target type on fixed pulse when running in targetType mode", () => {
    const notify = vi.fn()
    const api = { notify, getEntity: vi.fn() }
    const runtime = createRealtimeStreamSystem({
      targetType: "line",
      tickEvent: "streamTick",
      minIntervalMs: 100,
      intervalMs: 1000,
    })

    runtime.system.init({}, {}, api)
    vi.advanceTimersByTime(350)

    expect(notify).toHaveBeenCalledTimes(3)
    expect(notify).toHaveBeenNthCalledWith(1, "line:streamTick")
    runtime.stop()
  })

  it("should use controller interval when running in legacy controller mode", () => {
    const notify = vi.fn()
    const getEntity = vi.fn(() => ({ intervalMs: 450 }))
    const api = { notify, getEntity }
    const runtime = createRealtimeStreamSystem({
      controllerId: "realtimeStreamController",
      tickEvent: "streamTick",
      minIntervalMs: 100,
    })

    runtime.system.init({}, {}, api)
    vi.advanceTimersByTime(900)

    expect(getEntity).toHaveBeenCalledWith("realtimeStreamController")
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(
      1,
      "#realtimeStreamController:streamTick",
    )
    runtime.stop()
  })

  it("should not start interval when neither targetType nor controllerId is provided", () => {
    const notify = vi.fn()
    const api = { notify, getEntity: vi.fn() }
    const runtime = createRealtimeStreamSystem({
      controllerId: null,
      targetType: null,
    })

    runtime.system.init({}, {}, api)
    vi.advanceTimersByTime(500)

    expect(notify).not.toHaveBeenCalled()
    runtime.stop()
  })
})
