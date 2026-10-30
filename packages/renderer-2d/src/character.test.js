import { expect, test } from "vitest"

import { renderCharacter } from "./character.js"
import { callsTo, createContext } from "./test/canvas.js"

const A_SIZE = 40
const A_QUARTER_TURN = Math.PI / 2

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
  const [down, forward] = callsTo(drawing(), "lineTo")

  expect([down, forward]).toEqual([
    ["lineTo", 0, -6],
    ["lineTo", 6, 0],
  ])
})

test("it should turn to face the way it was told to", () => {
  const [, angle] = callsTo(
    drawing({ orientation: A_QUARTER_TURN }),
    "rotate",
  )[0]

  expect(angle).toBeCloseTo(-A_QUARTER_TURN, 9)
})

test("it should be drawn at its own position", () => {
  const [, x, y] = callsTo(drawing(), "translate")[0]

  expect([x, y]).toEqual([DEFAULT_RADIUS - 1, 0])
})

/** What a character asks a canvas to do. */
function drawing(entity = {}) {
  const { calls, ctx } = createContext()

  renderCharacter(entity, ctx)

  return calls
}
