import { absolutePosition } from "@inglorious/renderer-2d/absolute-position.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "./test/canvas.js"

const GAME_HEIGHT = 243

test("it should put the world on the canvas with its origin on the floor", () => {
  // The world counts up from the floor and the canvas counts down from its top edge, so
  // nothing is drawn until both are turned over.
  expect(whereItLands({ position: [0, 0, 0] })).toEqual([0, GAME_HEIGHT])
})

test("it should turn y over", () => {
  expect(whereItLands({ position: [10, 20, 0] })).toEqual([
    10,
    GAME_HEIGHT - 20,
  ])
})

test("it should turn the depth axis over the same way as y", () => {
  // Depth is what a top-down game reads as height, so it moves the same way.
  expect(whereItLands({ position: [0, 0, 30] })).toEqual([0, GAME_HEIGHT - 30])
})

test("it should draw the entity where it put it", () => {
  const { calls, ctx } = createContext()

  absolutePosition((_, where) => where.fillRect(0, 0, 10, 10))(
    { position: [10, 20, 0] },
    ctx,
    api,
  )

  expect(callsTo(calls, "fillRect")[0]).toEqual(["fillRect", 0, 0, 10, 10])
  expect(calls.at(-1)[0]).toBe("restore")
})

test("it should pass the entity and the api through to whatever it is drawing", () => {
  const seen = []
  const entity = { position: [0, 0, 0] }
  const { ctx } = createContext()

  absolutePosition((drawn, _, given) => seen.push([drawn, given]))(
    entity,
    ctx,
    api,
  )

  expect(seen).toEqual([[entity, api]])
})

function drawingNothing() {}

const game = { size: [432, GAME_HEIGHT] }
const api = { getEntity: () => game }

/** Where on the canvas an entity's position ends up. */
function whereItLands(entity) {
  const { calls, ctx } = createContext()

  absolutePosition(drawingNothing)(entity, ctx, api)

  const [, x, y] = callsTo(calls, "translate")[0]

  return [x, y]
}
