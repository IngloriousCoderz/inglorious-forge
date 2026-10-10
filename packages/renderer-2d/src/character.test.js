import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "./test/canvas.js"

const A_SIZE = 40
const A_QUARTER_TURN = Math.PI / 2

// A character with no size of its own is twenty-four across, which is what the renderer
// falls back to and therefore what most of these are talking about.
const DEFAULT_SIZE = 24
const DEFAULT_RADIUS = DEFAULT_SIZE / 2

test("it should be a circle of the size it was given", () => {
  const [, , , radius] = callsTo(drawing({ size: A_SIZE }), "arc")[0]

  expect(radius).toBe(A_SIZE / 2)
})

test("it should be light grey, so the direction it faces reads against it", () => {
  expect(callsTo(drawing(), "fillStyle").at(-1)).toEqual([
    "fillStyle",
    "lightgrey",
  ])
})

test("it should have a nose, so which way it faces is not ambiguous", () => {
  // A triangle off to one side, which is the whole of what says which way is forward.
  const [down, forward] = callsTo(drawing(), "lineTo")

  expect([down, forward]).toEqual([
    ["lineTo", 0, -6],
    ["lineTo", 6, 0],
  ])
})

test("it should turn to face the way it was told to", () => {
  // The world turns one way and the canvas the other, so the renderer negates it.
  const [, angle] = callsTo(
    drawing({ orientation: A_QUARTER_TURN }),
    "rotate",
  )[0]

  expect(angle).toBeCloseTo(-A_QUARTER_TURN, 9)
})

test("it should be drawn at its own position", () => {
  // The circle is a hair inside where the nose starts, which is what turns it into a head
  // rather than a dot.
  const [, x, y] = callsTo(drawing(), "translate")[0]

  expect([x, y]).toEqual([DEFAULT_RADIUS - 1, 0])
})

/** What a character asks a canvas to do. */
function drawing(entity = {}) {
  const { calls, ctx } = createContext()

  renderCharacter(entity, ctx)

  return calls
}
