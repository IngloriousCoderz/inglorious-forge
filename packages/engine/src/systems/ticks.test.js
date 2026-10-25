import { createStore } from "@inglorious/store/store.js"
import { describe, expect, test } from "vitest"

import { ticks } from "./ticks.js"

const A_FRAME = 1 / 60
const TEN_FPS = 10

describe("a world that turns at a rate of its own", () => {
  test("it waits for its rate before turning", () => {
    const store = build()

    run(store, 5)

    expect(store.getState().counter.turns).toBe(0)
  })

  test("it turns on the frame its rate is reached", () => {
    // Six frames of a sixtieth of a second is a tenth of a second, which is one turn for
    // a world turning ten times a second. The turn is notified during the update and
    // drained by the same pass, so it is not a frame late for having been told rather
    // than called.
    const store = build()

    run(store, 6)

    expect(store.getState().counter.turns).toBe(1)
  })

  test("it turns about as often as its rate says", () => {
    const store = build()

    run(store, 60)

    expect(store.getState().counter.turns).toBe(10)
  })

  test("a turn carries the time it covers, not the frame's", () => {
    const store = build()

    run(store, 6)

    expect(store.getState().counter.elapsed).toBeCloseTo(0.1)
  })

  test("it does not turn while the world is paused", () => {
    const store = build()

    store.notify("pause")
    run(store, 60)

    expect(store.getState().counter.turns).toBe(0)
  })

  test("it turns again once the world resumes", () => {
    const store = build()

    store.notify("pause")
    run(store, 60)
    store.notify("resume")
    run(store, 6)

    expect(store.getState().counter.turns).toBe(1)
  })

  test("a turn can be called something else", () => {
    const store = build({ event: "generation" })

    run(store, 6)

    expect(store.getState().counter.generations).toBe(1)
  })

  test("an unlimited rate turns every frame", () => {
    const store = build({ fps: Infinity })

    run(store, 3)

    expect(store.getState().counter.turns).toBe(3)
  })
})

function build({ fps = TEN_FPS, event } = {}) {
  return createStore({
    types: {
      Counter: {
        tick(entity, elapsed) {
          entity.turns += 1
          entity.elapsed = elapsed
        },

        generation(entity) {
          entity.generations += 1
        },
      },
    },
    entities: { counter: { type: "Counter", turns: 0, generations: 0 } },
    systems: [ticks({ fps, event })],
    updateMode: "manual",
    updateStrategy: "copy-on-dispatch",
  })
}

function run(store, frames) {
  for (let i = 0; i < frames; i++) {
    store.notify("update", A_FRAME)
    store.update()
  }
}
