import { renderButton } from "@inglorious/renderer-2d/form/button.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "../test/canvas.js"

const A_SIZE = [80, 40]

// What a button falls back to when it is not sized, shared with the renderer so that the
// two cannot drift apart.
const DEFAULT_SIZE = [100, 50]

test("it should be drawn on its own position, whichever way round it is", () => {
  // The box is centred rather than starting at the position, so a button sits under the
  // finger rather than beside it.
  const { left, right, top, bottom } = drawing({ size: A_SIZE }).box

  expect([left, right]).toEqual([-A_SIZE[0] / 2, A_SIZE[0] / 2])
  expect([top, bottom]).toEqual([-A_SIZE[1] / 2, A_SIZE[1] / 2])
})

test("it should take the size it was given", () => {
  expect(drawing({ size: A_SIZE }).box.right).toBe(40)
})

test("it should be black while it is not pressed", () => {
  expect(
    callsTo(drawing({ size: A_SIZE, state: "idle" }), "fillStyle")[0],
  ).toEqual(["fillStyle", "black"])
})

test("it should go white while it is pressed", () => {
  expect(
    callsTo(drawing({ size: A_SIZE, state: "pressed" }), "fillStyle")[0],
  ).toEqual(["fillStyle", "white"])
})

test("it should outline itself in the colour it was given", () => {
  const calls = drawing({ size: A_SIZE, color: "red", thickness: 3 })

  expect(callsTo(calls, "strokeStyle")[0]).toEqual(["strokeStyle", "red"])
  expect(callsTo(calls, "lineWidth")[0]).toEqual(["lineWidth", 3])
})

test("it should be drawn at the default size when it is given a short one", () => {
  // The defaults are per dimension, so a size of only a width still gets a height.
  expect(drawing({ size: [60] }).box.right).toBe(30)
  expect(drawing({ size: [60] }).box.bottom).toBe(25)
})

test("it should be drawn at a hundred by fifty when it is not given a size", () => {
  // The defaults on the dimensions used to be unreachable, because `const [width = 100] =
  // size` defaults an element of `size` and not `size` itself -- so a button with no size
  // threw instead of drawing at the size it says it draws at.
  const { right, bottom } = drawing({}).box

  expect([right, bottom]).toEqual([DEFAULT_SIZE[0] / 2, DEFAULT_SIZE[1] / 2])
})

/** What a button asks a canvas to do. */
function drawing(entity) {
  const { calls, ctx } = createContext()

  renderButton(entity, ctx)

  return calls
}
