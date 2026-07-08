import { withDebounce } from "@inglorious/web/decorators/with-debounce"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("withDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("debounces selected handlers until the configured delay elapses", () => {
    const saveData = vi.fn()
    const type = {
      saveData,
    }

    const behavior = withDebounce(150, ["saveData"])(type)
    const initialEntity = { id: "entity-1", value: 1 }
    let liveEntity = initialEntity
    const api = {
      getEntity: () => liveEntity,
    }

    behavior.saveData(initialEntity, { step: 1 }, api)
    liveEntity = { id: "entity-1", value: 2 }
    behavior.saveData(initialEntity, { step: 2 }, api)

    expect(saveData).not.toHaveBeenCalled()

    vi.advanceTimersByTime(149)
    expect(saveData).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(saveData).toHaveBeenCalledTimes(1)
    expect(saveData).toHaveBeenCalledWith(liveEntity, { step: 2 }, api)
  })

  it("supports per-handler delays and cancels pending work on destroy", () => {
    const saveData = vi.fn()
    const loadOptions = vi.fn()
    const destroy = vi.fn()
    const type = {
      saveData,
      loadOptions,
      destroy,
    }

    const behavior = withDebounce({ saveData: 200, loadOptions: 50 })(type)
    const entity = { id: "entity-2", value: 3 }
    const api = {
      getEntity: () => entity,
    }

    behavior.saveData(entity, { step: 1 }, api)
    behavior.loadOptions(entity, { step: 2 }, api)
    behavior.destroy(entity, {}, api)

    vi.advanceTimersByTime(1000)

    expect(saveData).not.toHaveBeenCalled()
    expect(loadOptions).not.toHaveBeenCalled()
    expect(destroy).toHaveBeenCalledWith(entity, {}, api)
  })
})
