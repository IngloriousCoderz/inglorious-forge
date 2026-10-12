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

test("it should draw a crosshair when it is not told what to draw", () => {
  // What it has always drawn, so games already out there keep pointing with it.
  expect(callsTo(drawing(), "lineTo").length).toBe(4)
})

test("an arrow should be one filled shape rather than a handful of lines", () => {
  const calls = drawing({ cursor: "arrow" })

  expect(callsTo(calls, "lineTo").length).toBeGreaterThan(2)
  expect(callsTo(calls, "fill").length).toBe(1)
})

test("an arrow should start where the finger is", () => {
  // The tip is the top-left corner of the shape, because that is where a pointer
  // points from.
  const [, x, y] = callsTo(drawing({ cursor: "arrow" }), "moveTo")[0]

  expect([x, y]).toEqual([0, 0])
})

test("a hand should be one filled shape rather than a handful of lines", () => {
  const calls = drawing({ cursor: "hand" })

  expect(callsTo(calls, "lineTo").length).toBeGreaterThan(2)
  expect(callsTo(calls, "fill").length).toBe(1)
})

test("a hand should hold its finger up", () => {
  // The finger is the only thing reaching the top edge: everything else stays below
  // it, which is what makes it a pointing hand rather than a mitten.
  const lines = callsTo(drawing({ cursor: "hand" }), "lineTo")
  const tops = lines.map(([, , y]) => y)

  expect(Math.min(...tops)).toBe(0)
  expect(tops.filter((y) => y === 0).length).toBeLessThanOrEqual(2)
})

test("the fingers beside the index should be fingers rather than steps", () => {
  // Each knuckle is about as wide as the index itself, so what stands to its right
  // reads as more fingers rather than as a fist with one big middle finger.
  const calls = drawing({ cursor: "hand" })
  const starts = callsTo(calls, "moveTo").map(([, x, y]) => [x, y])
  const lines = callsTo(calls, "lineTo").map(([, x, y]) => [x, y])
  const points = [...starts, ...lines]

  // The flat runs along the top, in the order they are drawn: the index first, then a
  // knuckle each.
  const flats = points
    .slice(1)
    .map(([x, y], index) =>
      y === points[index][1] ? Math.abs(x - points[index][0]) : null,
    )
    .filter((width) => width !== null)
    .slice(0, 3)

  expect(flats.length).toBe(3)
  expect(flats.every((width) => width >= 2)).toBe(true)
})

test("every cursor should be drawn in the colour it was given", () => {
  for (const cursor of ["crosshair", "arrow", "hand"]) {
    const calls = drawing({ cursor, color: "white" })

    expect(callsTo(calls, "fillStyle")[0]).toEqual(["fillStyle", "white"])
  }
})

test("the arrow and the hand should be outlined in black", () => {
  // A white pointer with no outline washes out wherever the game is light, so the two
  // filled cursors carry a dark edge while the crosshair stays one colour throughout.
  for (const cursor of ["arrow", "hand"]) {
    const calls = drawing({ cursor, color: "white" })

    expect(callsTo(calls, "strokeStyle")[0]).toEqual(["strokeStyle", "black"])
  }
})

test("it should outline in the colour it was given", () => {
  const calls = drawing({ cursor: "hand", outlineColor: "red" })

  expect(callsTo(calls, "strokeStyle")[0]).toEqual(["strokeStyle", "red"])
})

test("the crosshair should stay one colour throughout", () => {
  const calls = drawing({ outlineColor: "red" })

  expect(callsTo(calls, "strokeStyle")[0]).toEqual(["strokeStyle", "black"])
})

/** What the cursor asks a canvas to do. */
function drawing(entity = {}) {
  const { calls, ctx } = createContext()

  renderMouse(entity, ctx)

  return calls
}
