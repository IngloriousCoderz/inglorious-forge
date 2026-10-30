import { expect, test } from "vitest"

import { renderMouse } from "./mouse.js"
import { callsTo, createContext } from "./test/canvas.js"

const A_QUARTER_TURN = Math.PI / 2

test("it should point four ways, with a gap in each", () => {
  const strokes = callsTo(drawing(), "stroke").length
  const lines = callsTo(drawing(), "lineTo").length

  expect(strokes).toBe(4)
  expect(lines).toBe(4)
})

test("it should point straight up when it is not told which way to point", () => {
  const [, angle] = callsTo(drawing(), "rotate")[0]

  expect(angle).toBeCloseTo(0, 9)
})

test("it should turn the way the entity says", () => {
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
  expect(callsTo(drawing(), "lineTo").length).toBe(4)
})

test("an arrow should be one filled shape rather than a handful of lines", () => {
  const calls = drawing({ cursor: "arrow" })

  expect(callsTo(calls, "lineTo").length).toBeGreaterThan(2)
  expect(callsTo(calls, "fill").length).toBe(1)
})

test("an arrow should start where the finger is", () => {
  const [, x, y] = callsTo(drawing({ cursor: "arrow" }), "moveTo")[0]

  expect([x, y]).toEqual([0, 0])
})

test("a hand should be one filled shape rather than a handful of lines", () => {
  const calls = drawing({ cursor: "hand" })

  expect(callsTo(calls, "lineTo").length).toBeGreaterThan(2)
  expect(callsTo(calls, "fill").length).toBe(1)
})

test("a hand should hold its finger up", () => {
  const lines = callsTo(drawing({ cursor: "hand" }), "lineTo")
  const tops = lines.map(([, , y]) => y)

  expect(Math.min(...tops)).toBe(0)
  expect(tops.filter((y) => y === 0).length).toBeLessThanOrEqual(2)
})

test("the fingers beside the index should be fingers rather than steps", () => {
  const calls = drawing({ cursor: "hand" })
  const starts = callsTo(calls, "moveTo").map(([, x, y]) => [x, y])
  const lines = callsTo(calls, "lineTo").map(([, x, y]) => [x, y])
  const points = [...starts, ...lines]

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
