import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "./test/canvas.js"

const A_QUARTER_TURN = Math.PI / 2

test("it should point four ways, with a gap in each", () => {
  // Four ticks, each drawn as a line that is stroked on its own, so the cross reads as a
  // cross rather than as a plus.
  const strokes = callsTo(drawing(), "stroke").length
  const lines = callsTo(drawing(), "lineTo").length

  expect(strokes).toBe(4)
  expect(lines).toBe(4)
})

test("it should point straight up when it is not told which way to point", () => {
  // Close to, because turning by "no turning at all" comes out as `-0`.
  const [, angle] = callsTo(drawing(), "rotate")[0]

  expect(angle).toBeCloseTo(0, 9)
})

test("it should turn the way the entity says", () => {
  // The world turns one way and the canvas the other, so the renderer negates it.
  expect(
    callsTo(drawing({ orientation: A_QUARTER_TURN }), "rotate")[0],
  ).toEqual(["rotate", -A_QUARTER_TURN])
})

test("it should draw its middle", () => {
  const [, , , width, height] = callsTo(drawing(), "fillRect")[0]

  expect([width, height]).toEqual([1, 1])
})

test("it should be drawn in the colour it was given", () => {
  const calls = drawing({ color: "red", thickness: 3 })

  expect(callsTo(calls, "strokeStyle")[0]).toEqual(["strokeStyle", "red"])
  expect(callsTo(calls, "lineWidth")[0]).toEqual(["lineWidth", 3])
})

test("it should let go of the context when it is done", () => {
  const calls = drawing()

  expect(calls[0][0]).toBe("save")
  expect(calls.at(-1)[0]).toBe("restore")
})

/** What the cursor asks a canvas to do. */
function drawing(entity = {}) {
  const { calls, ctx } = createContext()

  renderMouse(entity, ctx)

  return calls
}
