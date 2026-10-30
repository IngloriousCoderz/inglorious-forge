import { expect, test } from "vitest"

import { callsTo, createContext } from "../test/canvas.js"
import { renderSlider } from "./slider.js"

const A_SIZE = [100, 20]

test("it should draw a track as wide as it is", () => {
  expect(trackWidth({ size: A_SIZE })).toBe(A_SIZE[0])
})

test("the track should be drawn on its own position, whichever way round it is", () => {
  const [, left, , width] = callsTo(drawing({ size: A_SIZE }), "fillRect")[0]

  expect([left, left + width]).toEqual([-A_SIZE[0] / 2, A_SIZE[0] / 2])
})

test("it should fill the track up to the value", () => {
  expect(fillWidth({ size: A_SIZE, min: 0, max: 10, value: 5 })).toBe(
    A_SIZE[0] / 2,
  )
})

test("a value at either end should fill the whole track or none of it", () => {
  expect(fillWidth({ size: A_SIZE, min: 0, max: 10, value: 0 })).toBe(0)
  expect(fillWidth({ size: A_SIZE, min: 0, max: 10, value: 10 })).toBe(
    A_SIZE[0],
  )
})

test("it should draw the knob where the value is", () => {
  const { box } = drawing({ size: A_SIZE, min: 0, max: 10, value: 5 })

  expect(box.left + box.right).toBeCloseTo(0)
})

test("the knob should travel with the value", () => {
  const low = knobAt({ min: 0, max: 10, value: 2 })
  const high = knobAt({ min: 0, max: 10, value: 8 })

  expect(high).toBeGreaterThan(low)
})

test("it should draw its label to the left of the track", () => {
  const calls = drawing({
    size: A_SIZE,
    label: "Max age",
    min: 0,
    max: 10,
    value: 5,
  })

  expect(callsTo(calls, "fillText")[0]).toEqual(["fillText", "Max age", 0, 0])
  expect(callsTo(calls, "translate")[0].slice(1)).toEqual([
    -A_SIZE[0] / 2 - 12,
    0,
  ])
})

test("it should draw the value to the right of the track", () => {
  const calls = drawing({ size: A_SIZE, min: 0, max: 10, value: 5 })

  expect(callsTo(calls, "fillText")[0]).toEqual(["fillText", "5", 0, 0])
})

test("it should show as many decimals as the step has", () => {
  const calls = drawing({
    size: A_SIZE,
    min: 0,
    max: 1,
    step: 0.01,
    value: 0.020000000000000004,
  })

  expect(callsTo(calls, "fillText")[0]).toEqual(["fillText", "0.02", 0, 0])
})

test("a whole-number step should show no decimals at all", () => {
  const calls = drawing({ size: A_SIZE, min: 0, max: 10, step: 1, value: 5 })

  expect(callsTo(calls, "fillText")[0]).toEqual(["fillText", "5", 0, 0])
})

test("a value with no room between the steps should not run past the track", () => {
  expect(fillWidth({ size: A_SIZE, min: 0, max: 1, value: 99 })).toBe(A_SIZE[0])
})

test("it should draw at a hundred by twenty when it is not given a size", () => {
  expect(trackWidth({})).toBe(100)
})

test("it should draw the track in the background colour it was given", () => {
  const calls = drawing({ size: A_SIZE, backgroundColor: "rgb(1, 2, 3)" })

  expect(callsTo(calls, "fillStyle")[0]).toEqual(["fillStyle", "rgb(1, 2, 3)"])
})

/** What a slider asks a canvas to do. */
function drawing(entity) {
  const { calls, ctx } = createContext()

  renderSlider({ size: A_SIZE, ...entity }, ctx)

  return calls
}

/** How wide the whole track is, which is the first rectangle drawn. */
function trackWidth(entity) {
  return callsTo(drawing(entity), "fillRect")[0][3]
}

/** How wide the filled part is, which is the second rectangle drawn. */
function fillWidth(entity) {
  return callsTo(drawing(entity), "fillRect")[1][3]
}

/** Where the middle of the knob has come to, the knob being the last box drawn. */
function knobAt(entity) {
  const { box } = drawing({ size: A_SIZE, ...entity })

  return (box.left + box.right) / 2
}
