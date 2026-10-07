import { expect, test } from "vitest"

import {
  abs,
  clamp,
  isBetween,
  isClose,
  mod,
  sign,
  snap,
  sqrt,
} from "./number.js"

test("it should return the same number if already positive", () => {
  const num = 42
  const expectedResult = 42

  expect(abs(num)).toBe(expectedResult)
})

test("it should return the absolute value of a number", () => {
  const num = -42
  const expectedResult = 42

  expect(abs(num)).toBe(expectedResult)
})

test("it should not clamp a number in the range", () => {
  const num = 42
  const min = 0
  const max = 100
  const expectedResult = 42

  expect(clamp(num, min, max)).toBe(expectedResult)
})

test("it should clamp a number too small", () => {
  const num = -42
  const min = 0
  const max = 100
  const expectedResult = 0

  expect(clamp(num, min, max)).toBe(expectedResult)
})

test("it should clamp a number too big", () => {
  const num = 142
  const min = 0
  const max = 100
  const expectedResult = 100

  expect(clamp(num, min, max)).toBe(expectedResult)
})

test("it should return true if a number is between min and max", () => {
  const num = 50
  const min = 0
  const max = 100
  const expectedResult = true

  expect(isBetween(num, min, max)).toBe(expectedResult)
})

test("it should return true if a number is equal to min", () => {
  const num = 0
  const min = 0
  const max = 100
  const expectedResult = true

  expect(isBetween(num, min, max)).toBe(expectedResult)
})

test("it should return true if a number is equal to max", () => {
  const num = 100
  const min = 0
  const max = 100
  const expectedResult = true

  expect(isBetween(num, min, max)).toBe(expectedResult)
})

test("it should return false if a number is lower than min", () => {
  const num = -1
  const min = 0
  const max = 100
  const expectedResult = false

  expect(isBetween(num, min, max)).toBe(expectedResult)
})

test("it should return false if a number is greater than max", () => {
  const num = 101
  const min = 0
  const max = 100
  const expectedResult = false

  expect(isBetween(num, min, max)).toBe(expectedResult)
})

test("it should check if two numbers are close given some tolerance", () => {
  const num1 = 42
  const num2 = 42.1
  const tolerance = 0.2
  const expectedResult = true

  expect(isClose(num1, num2, tolerance)).toBe(expectedResult)
})

test("it should return zero if dividend equals divisor", () => {
  const num = 2
  const divisor = 2
  const expectedResult = 0

  expect(mod(num, divisor)).toBe(expectedResult)
})

test("it should return one if number is odd", () => {
  const num = 3
  const divisor = 2
  const expectedResult = 1

  expect(mod(num, divisor)).toBe(expectedResult)
})

test("it should return one if negative number turns to positive one", () => {
  const num = -3
  const divisor = 2
  const expectedResult = 1

  expect(mod(num, divisor)).toBe(expectedResult)
})

test("it should convert a float number greater than 1 to a range between -1 and 1", () => {
  const num = 5 / 4
  const divisor = 1
  const expectedResult = 1 / 4

  expect(mod(num, divisor)).toBe(expectedResult)
})

test("it should convert a float number greater than 2 to a range between -1 and 1", () => {
  const num = 13 / 4
  const divisor = 1
  const expectedResult = 1 / 4

  expect(mod(num, divisor)).toBe(expectedResult)
})

test("it should convert a negative float number to a range between -1 and 1", () => {
  const num = -5 / 4
  const divisor = 1
  const expectedResult = 3 / 4

  expect(mod(num, divisor)).toBe(expectedResult)
})

test("it should return the dividend if the divisor is zero", () => {
  const num = 42
  const divisor = 0

  expect(mod(num, divisor)).toBe(num)
})

test("it should return one if number is positive", () => {
  const num = 42
  const expectedResult = 1

  expect(sign(num)).toBe(expectedResult)
})

test("it should return minus one if number is negative", () => {
  const num = -42
  const expectedResult = -1

  expect(sign(num)).toBe(expectedResult)
})

test("it should return the number itself if the sign is zero", () => {
  const num = 0
  const expectedResult = 0

  expect(sign(num)).toBe(expectedResult)
})

test("it should snap the number to the given precision", () => {
  const num = 42
  const precision = 10
  const expectedResult = 40

  expect(snap(num, precision)).toBe(expectedResult)
})

test("it should compute the square root of the number", () => {
  const num = 9
  const expectedResult = 3

  expect(sqrt(num)).toBe(expectedResult)
})
