import { renderCircle } from "@inglorious/renderer-2d/shapes/circle.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "../test/canvas.js"

const A_RADIUS = 10
const A_STROKE = 3

test("it should draw a whole circle", () => {
  const [, , , , from, to] = arcOf(drawing({ radius: A_RADIUS }))

  expect(from).toBe(0)
  expect(to).toBeCloseTo(Math.PI * 2, 9)
})

test("it should draw at the radius it was given", () => {
  const [, x, y, radius] = arcOf(drawing({ radius: A_RADIUS }))

  expect(radius).toBe(A_RADIUS)
  // Close to rather than equal, because a world offset of nothing comes out as `-0`, which
  // a canvas draws in the same place but which is not the same number.
  expect(x).toBeCloseTo(0, 9)
  expect(y).toBeCloseTo(0, 9)
})

test("it should turn the world over the way everything else does", () => {
  // Up the world is a negative y on the canvas, and the depth axis comes off as well.
  const [, x, y] = arcOf(drawing({ offset: [5, 20, 3] }))

  expect([x, y]).toEqual([5, -23])
})

test("it should take its colour and thickness from the entity", () => {
  const calls = drawing({
    color: "red",
    backgroundColor: "blue",
    thickness: A_STROKE,
  })

  expect(callsTo(calls, "strokeStyle")[0]).toEqual(["strokeStyle", "red"])
  expect(callsTo(calls, "fillStyle")[0]).toEqual(["fillStyle", "blue"])
  expect(callsTo(calls, "lineWidth")[0]).toEqual(["lineWidth", A_STROKE])
})

test("it should fill what it has outlined", () => {
  const names = drawing({}).map(([name]) => name)

  expect(names).toEqual([
    "save",
    "lineWidth",
    "strokeStyle",
    "fillStyle",
    "beginPath",
    "arc",
    "fill",
    "stroke",
    "closePath",
    "restore",
  ])
})

/** What a circle asks a canvas to do. */
function drawing(entity) {
  const { calls, ctx } = createContext()

  renderCircle(entity, ctx)

  return calls
}

function arcOf(calls) {
  return callsTo(calls, "arc")[0]
}
