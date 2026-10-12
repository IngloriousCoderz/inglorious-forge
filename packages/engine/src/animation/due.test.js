import { dueAt } from "@inglorious/engine/animation/due.js"
import { describe, expect, test } from "vitest"

const A_TENTH = 0.1
const A_SIXTIETH = 1 / 60

describe("something held to a rate", () => {
  test("it is not due before the interval has passed", () => {
    // Five frames of a sixtieth of a second is under a tenth of one.
    expect(run(dueAt(A_TENTH), 5).turns).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ])
  })

  test("it is due once the interval has passed", () => {
    const { turns } = run(dueAt(A_TENTH), 6)

    expect(turns[5]).toBeCloseTo(A_TENTH)
  })

  test("a shade short of the interval still counts as reaching it", () => {
    // Frame times are added up one at a time, and six of a sixtieth of a second come to
    // a hair under a tenth of one -- which would otherwise leave something moving ten
    // times a second moving at nine.
    const clock = addedUp(6)

    expect(clock).toBeLessThan(A_TENTH)

    const { elapsed, since } = dueAt(A_TENTH)(clock, 0)

    expect(elapsed).toBeCloseTo(clock)
    expect(since).toBe(0)
  })

  test("the time it is told should add up to the time that passed", () => {
    const { turns, clock } = run(dueAt(A_TENTH), 60)

    // A second of frames at ten turns a second is ten turns covering a second between
    // them: nothing lost, nothing invented, no drifting behind the clock.
    expect(turns.filter((turn) => turn !== undefined)).toHaveLength(10)
    expect(turns.reduce((sum, turn) => sum + (turn ?? 0), 0)).toBeCloseTo(1)
    expect(clock).toBeCloseTo(0)
  })

  test("a frame that leaves more time than the interval carries all of it", () => {
    // The rate is a ceiling and not a floor: one slow frame is one turn covering all of
    // itself rather than a turn that falls further and further behind.
    const { turns, clock } = run(dueAt(A_TENTH), 1, 0.25)

    expect(turns[0]).toBeCloseTo(0.25)
    expect(clock).toBe(0)
  })

  test("it is due every time when there is no rate at all", () => {
    const { turns } = run(dueAt(0), 3)

    expect(turns.every((turn) => turn !== undefined)).toBe(true)
  })

  test("two things held to the same rate do not share one clock", () => {
    // The time is handed back rather than kept, which is what lets an entity and a
    // system ask the same question without sharing the answer.
    const isDue = dueAt(A_TENTH)

    expect(run(isDue, 6).turns[5]).toBeCloseTo(A_TENTH)
    expect(run(isDue, 1).turns[0]).toBeUndefined()
  })
})

/** Asks a number of times, carrying the time between them as a caller has to. */
function run(isDue, frames, dt = A_SIXTIETH) {
  let clock = 0
  const turns = []

  for (let i = 0; i < frames; i += 1) {
    const { elapsed, since } = isDue(clock, dt)

    clock = since
    turns.push(elapsed)
  }

  return { turns, clock }
}

/** A frame time added up the way a loop adds it, rather than multiplied out. */
function addedUp(frames, dt = A_SIXTIETH) {
  let clock = 0

  for (let i = 0; i < frames; i += 1) {
    clock += dt
  }

  return clock
}
