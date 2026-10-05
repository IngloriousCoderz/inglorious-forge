import { expect, test } from "vitest"

import {
  flipped,
  FLIPPED_HORIZONTALLY_FLAG,
  FLIPPED_VERTICALLY_FLAG,
} from "./flags.js"

test("it should say that a frame is a mirror of another", () => {
  const mirrored = flipped(23)

  // The readers take these apart with the bitwise operators, so the flag has to survive
  // being stored in a number and read back out.
  expect(mirrored & FLIPPED_HORIZONTALLY_FLAG).not.toBe(0)
  expect(mirrored & ~FLIPPED_HORIZONTALLY_FLAG).toBe(23)
})

test("it should leave the other flags alone", () => {
  // A frame mirrored upwards is a different frame, and setting one flag must not be read
  // as the other.
  expect(flipped(23) & FLIPPED_VERTICALLY_FLAG).toBe(0)
})

test("it should give a whole number rather than one past the range", () => {
  // Adding the flag gives something larger than 2^31, which is not an integer a bitwise
  // operator can be relied upon to keep hold of.
  expect(Number.isInteger(flipped(23))).toBe(true)
  expect(flipped(23)).toBe(flipped(23) | 0)
})

test("it should say which of two frames it is", () => {
  expect(flipped(23)).not.toBe(flipped(29))
  expect(flipped(23)).not.toBe(23)
})
