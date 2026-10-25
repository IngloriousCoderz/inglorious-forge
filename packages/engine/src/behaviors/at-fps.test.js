import { createGame } from "@inglorious/engine/test.js"
import { augmentType } from "@inglorious/store/types.js"
import { describe, expect, test, vi } from "vitest"

import { atFps } from "./at-fps.js"

const A_FRAME = 1 / 60
const TEN_FPS = 10

const api = {}

describe("an entity with a rate of its own", () => {
  test("it waits for its rate before moving", () => {
    const { type, entity } = build()

    run(type, entity, 5)

    expect(entity.moved).toBe(0)
  })

  test("it moves once its rate has been reached", () => {
    // Six frames of a sixtieth of a second is a tenth of a second, which is one turn for
    // something moving ten times a second.
    const { type, entity } = build()

    run(type, entity, 6)

    expect(entity.moved).toBe(1)
  })

  test("it moves about as often as its rate says", () => {
    // A second of frames is sixty of them, and a second of ten moves is ten.
    const { type, entity } = build()

    run(type, entity, 60)

    expect(entity.moved).toBe(10)
  })

  test("it is told the time since its last move, not the frame's", () => {
    // Six sixtieths of a second, which a game moving by velocity times dt has to move
    // by in full or it runs six times too slowly for asking to move ten times a second.
    const { type, entity } = build()

    run(type, entity, 6)

    expect(entity.elapsed).toBeCloseTo(0.1)
  })

  test("the time it is told should add up to the time that passed", () => {
    const { type, entity } = build()

    run(type, entity, 60)

    expect(entity.elapsed).toBeCloseTo(1)
  })

  test("a frame that leaves more time than the rate allows carries all of it", () => {
    // The rate is a ceiling and not a floor: a slow frame is one move covering all of
    // itself rather than a move that falls further and further behind.
    const { type, entity } = build()

    run(type, entity, 3, 0.2)

    expect(entity.moved).toBe(3)
    expect(entity.elapsed).toBeCloseTo(0.6)
  })

  test("each entity keeps its own time", () => {
    // Two animals of the same kind, one of them born a moment after the other: they are
    // not a single clock the first of them would spend for both.
    const { type } = build()
    const early = { id: "early", type: "Thing", moved: 0, elapsed: 0 }
    const late = { id: "late", type: "Thing", moved: 0, elapsed: 0 }

    type.create(early, null, api)
    run(type, early, 5)

    type.create(late, null, api)
    run(type, late, 1)

    expect(early.moved).toBe(0)
    expect(late.moved).toBe(0)
  })

  test("it moves every frame when told to move at no rate at all", () => {
    const { type, entity } = build(Infinity)

    run(type, entity, 5)

    expect(entity.moved).toBe(5)
  })

  test("it gates everything it is put in front of", () => {
    const behind = vi.fn()
    const { type, entity } = build(TEN_FPS, [{ update: behind }])

    run(type, entity, 5)
    expect(behind).not.toHaveBeenCalled()

    run(type, entity, 1)
    expect(behind).toHaveBeenCalledTimes(1)
  })

  test("a behavior put after it takes the gating away", () => {
    // The reason it has to go last, written as a test because it is invisible
    // otherwise: each behavior wraps the ones before it, so anything after this one is
    // reached first and this one never gets to say.
    const ahead = vi.fn()
    const type = augmentType([atFps(TEN_FPS), { update: ahead }])
    const entity = { id: "thing", type: "Thing" }

    type.create(entity, null, api)
    run(type, entity, 5)

    expect(ahead).toHaveBeenCalledTimes(5)
  })

  test("it does not stop the frame from being drawn", () => {
    // The whole point of keeping its own time: the loop, and what is drawn on it, are
    // not this entity's to slow down.
    const frame = vi.fn()
    const game = createGame({
      types: {
        Thing: [atFps(TEN_FPS)],
        Frame: [{ update: frame }],
      },
      entities: {
        game: { type: "Game", size: [800, 600] },
        thing: { type: "Thing", moved: 0 },
        frame: { type: "Frame" },
      },
    })

    game.step(5)

    expect(game.entity("thing").moved).toBe(0)
    expect(frame).toHaveBeenCalledTimes(5)
  })
})

/** A type with a rate in front of a behavior that counts how often it was called. */
function build(fps = TEN_FPS, behaviors = []) {
  const type = augmentType([
    {
      update(entity, dt) {
        entity.moved = (entity.moved ?? 0) + 1
        entity.elapsed = (entity.elapsed ?? 0) + dt
      },
    },
    ...behaviors,
    atFps(fps),
  ])

  const entity = { id: "thing", type: "Thing", moved: 0, elapsed: 0 }
  type.create(entity, null, api)

  return { type, entity }
}

/** Runs an entity's update a number of times, each frame a given length. */
function run(type, entity, frames, dt = A_FRAME) {
  for (let i = 0; i < frames; i += 1) {
    type.update(entity, dt, api)
  }
}
