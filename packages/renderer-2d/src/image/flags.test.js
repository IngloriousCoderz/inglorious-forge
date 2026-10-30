import { expect, test } from "vitest"

import {
  FLIPPED_HORIZONTALLY_FLAG,
  FLIPPED_VERTICALLY_FLAG,
  flippedHorizontally,
  flippedVertically,
} from "./flags.js"

test("it should say that a frame is a mirror of another", () => {
  const mirrored = flippedHorizontally(23)

  expect(mirrored & FLIPPED_HORIZONTALLY_FLAG).not.toBe(0)
  expect(mirrored & ~FLIPPED_HORIZONTALLY_FLAG).toBe(23)
})

test("it should leave the other flags alone", () => {
  expect(flippedHorizontally(23) & FLIPPED_VERTICALLY_FLAG).toBe(0)
})

test("it should mirror a frame top to bottom", () => {
  const mirrored = flippedVertically(23)

  expect(mirrored & FLIPPED_VERTICALLY_FLAG).not.toBe(0)
  expect(mirrored & ~FLIPPED_VERTICALLY_FLAG).toBe(23)
  expect(flippedVertically(23) & FLIPPED_HORIZONTALLY_FLAG).toBe(0)
  expect(flippedVertically(23)).not.toBe(flippedHorizontally(23))
  expect(Number.isInteger(flippedVertically(23))).toBe(true)
})

test("it should mirror a frame both ways at once", () => {
  const both = flippedVertically(flippedHorizontally(23))

  expect(both & FLIPPED_HORIZONTALLY_FLAG).not.toBe(0)
  expect(both & FLIPPED_VERTICALLY_FLAG).not.toBe(0)
  expect(both & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG)).toBe(23)
})

test("it should give a whole number rather than one past the range", () => {
  expect(Number.isInteger(flippedHorizontally(23))).toBe(true)
  expect(flippedHorizontally(23)).toBe(flippedHorizontally(23) | 0)
})

test("it should say which of two frames it is", () => {
  expect(flippedHorizontally(23)).not.toBe(flippedHorizontally(29))
  expect(flippedHorizontally(23)).not.toBe(23)
})
