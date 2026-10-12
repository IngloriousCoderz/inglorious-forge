import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { FixedLoop } from "./fixed.js"

const A_HUNDRED_MILLISECONDS = 100
const A_SECOND = 1000

describe("a fixed loop", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  test("it should update at the rate it was asked for", async () => {
    const engine = { update: vi.fn() }
    const loop = new FixedLoop()

    const run = loop.start(engine, A_HUNDRED_MILLISECONDS)
    // Past the two updates on the boundary: the loop updates once to begin with and
    // then once per interval, so measuring from the second one counts ten in a second
    // rather than eleven with the starting one thrown in.
    await vi.advanceTimersByTimeAsync(A_HUNDRED_MILLISECONDS)
    engine.update.mockClear()

    await vi.advanceTimersByTimeAsync(A_SECOND)
    loop.stop()
    await finish(run)

    expect(engine.update).toHaveBeenCalledTimes(10)
  })

  test("it should sleep what is left of the interval rather than the interval again", () => {
    // given an update that takes half the interval
    const engine = {
      update: vi.fn(() => {
        vi.setSystemTime(Date.now() + A_HUNDRED_MILLISECONDS / 2)
      }),
    }

    // when the loop runs once, up to its sleep
    const [slept] = firstSleep(engine, A_HUNDRED_MILLISECONDS)

    // then it waits out the remaining half: sleeping the work on top of the wait would
    // halve the rate, because every frame would wait out its own cost twice
    expect(slept).toBe(A_HUNDRED_MILLISECONDS / 2)
  })

  test("a frame that overran its budget should start the next one straight away", () => {
    // given an update that takes twice the interval
    const engine = {
      update: vi.fn(() => {
        vi.setSystemTime(Date.now() + A_HUNDRED_MILLISECONDS * 2)
      }),
    }

    // when the loop runs once, up to its sleep
    const [slept] = firstSleep(engine, A_HUNDRED_MILLISECONDS)

    // then it does not wait at all rather than waiting out a debt as well as the work
    expect(slept).toBe(0)
  })

  /**
   * Runs the loop once, synchronously up to its sleep, and reports what it slept.
   *
   * The timer is stood in for rather than asserted on directly, because the fake-timer
   * stand-in is not a spy anything can be asked about afterwards.
   */
  function firstSleep(engine, msPerUpdate) {
    const slept = []
    const timer = globalThis.setTimeout

    vi.stubGlobal("setTimeout", (callback, ms, ...rest) => {
      slept.push(ms)
      return timer(callback, ms, ...rest)
    })

    const loop = new FixedLoop()
    loop.start(engine, msPerUpdate)
    loop.stop()

    return slept
  }

  /**
   * Lets a stopped loop out of the sleep it was in when it was stopped, so that
   * awaiting it ends rather than hanging on a timer nothing will advance past.
   */
  async function finish(run) {
    await vi.runAllTimersAsync()
    await run
  }
})
