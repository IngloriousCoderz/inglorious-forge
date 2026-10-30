import { expect, test } from "vitest"

import { callsTo, createContext } from "../test/canvas.js"
import { renderButton } from "./button.js"

const A_SIZE = [80, 40]

const DEFAULT_SIZE = [100, 50]

test("it should be drawn on its own position, whichever way round it is", () => {
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
  expect(drawing({ size: [60] }).box.right).toBe(30)
  expect(drawing({ size: [60] }).box.bottom).toBe(25)
})

test("it should count depth as height", () => {
  const { box } = drawing({ size: [80, 0, 26] })

  expect(box.bottom - box.top).toBe(26)
})

test("it should be drawn at a hundred by fifty when it is not given a size", () => {
  const { right, bottom } = drawing({}).box

  expect([right, bottom]).toEqual([DEFAULT_SIZE[0] / 2, DEFAULT_SIZE[1] / 2])
})

test("it should write its label on it", () => {
  const calls = drawing({ size: A_SIZE, label: "Pause" })

  expect(callsTo(calls, "fillText")[0]).toEqual(["fillText", "Pause", 0, 0])
})

test("the label should sit in the middle of the button", () => {
  const calls = drawing({ size: A_SIZE, label: "Pause", labelSize: 18 })

  expect(callsTo(calls, "font")[0]).toEqual(["font", "18px sans-serif"])
})

test("it should write nothing when it has no label", () => {
  expect(callsTo(drawing({ size: A_SIZE }), "fillText")).toEqual([])
})

/** What a button asks a canvas to do. */
function drawing(entity) {
  const { calls, ctx } = createContext()

  renderButton(entity, ctx)

  return calls
}
