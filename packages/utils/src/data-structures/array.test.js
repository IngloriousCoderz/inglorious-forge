import { expect, test } from "vitest"

import {
  contains,
  cycleIndex,
  ensureArray,
  isArray,
  max,
  min,
  pop,
  push,
  remove,
} from "./array.js"

test("it should check if an array contains a value", () => {
  const arr = [3, 2, 6, 1, 7, 4, 5]
  const item = 1
  const expectedResult = true

  expect(contains(arr, item)).toBe(expectedResult)
})

test("it should check if an array contains an object", () => {
  const arr = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]
  const item = arr[3]
  const expectedResult = true

  expect(contains(arr, item)).toBe(expectedResult)
})

test("it should return the same array if the value is already an array", () => {
  const arr = [1, "two", { three: 3 }]

  expect(ensureArray(arr)).toBe(arr)
})

test("it should wrap the value in an array if it is not an array", () => {
  const str = "hello"

  expect(ensureArray(str)).toStrictEqual([str])
})

test("it should correctly identify an array", () => {
  const arr = [1, "two", { three: 3 }]

  expect(isArray(arr)).toBe(true)
})

test("it should correctly identify a non-array", () => {
  const str = "hello"

  expect(isArray(str)).toBe(false)
})

test("it should find the maximum value of an array", () => {
  const arr = [3, 2, 6, 1, 7, 4, 5]
  const expectedResult = 7

  expect(max(arr)).toBe(expectedResult)
})

test("it should find the maximum value in an array of objects", () => {
  const arr = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]
  const comparator = (a, b) => b.value - a.value
  const expectedResult = { value: 7 }

  expect(max(arr, comparator)).toStrictEqual(expectedResult)
})

test("it should find the minimum value of an array", () => {
  const arr = [3, 2, 6, 1, 7, 4, 5]
  const expectedResult = 1

  expect(min(arr)).toBe(expectedResult)
})

test("it should find the minimum value in an array of objects", () => {
  const arr = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]
  const comparator = (a, b) => b.value - a.value
  const expectedResult = { value: 1 }

  expect(min(arr, comparator)).toStrictEqual(expectedResult)
})

test("it should remove the minimum value from an array", () => {
  const arr = [3, 2, 6, 1, 7, 4, 5]
  const expectedResult = [3, 2, 6, 7, 4, 5]

  expect(pop(arr)).toStrictEqual(expectedResult)
})

test("it should remove the minimum object from an array", () => {
  const arr = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]
  const comparator = (a, b) => b.value - a.value
  const expectedResult = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]

  expect(pop(arr, comparator)).toStrictEqual(expectedResult)
})

test("it should remove the maximum value from an array", () => {
  const arr = [3, 2, 6, 1, 7, 4, 5]
  const comparator = (a, b) => a - b
  const expectedResult = [3, 2, 6, 1, 4, 5]

  expect(pop(arr, comparator)).toStrictEqual(expectedResult)
})

test("it should remove the maximum object from an array", () => {
  const arr = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]
  const comparator = (a, b) => a.value - b.value
  const expectedResult = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 4 },
    { value: 5 },
  ]

  expect(pop(arr, comparator)).toStrictEqual(expectedResult)
})

test("it should add a value at the end of the array", () => {
  const arr = [3, 2, 6, 1, 7, 4]
  const item = 5
  const expectedResult = [3, 2, 6, 1, 7, 4, 5]

  expect(push(arr, item)).toStrictEqual(expectedResult)
})

test("it should remove a primitive value from an array", () => {
  const arr = [3, 2, 6, 1, 7, 4, 5]
  const item = 1
  const expectedResult = [3, 2, 6, 7, 4, 5]

  expect(remove(arr, item)).toStrictEqual(expectedResult)
})

test("it should remove an object from an array", () => {
  const arr = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 1 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]
  const item = arr[3]
  const expectedResult = [
    { value: 3 },
    { value: 2 },
    { value: 6 },
    { value: 7 },
    { value: 4 },
    { value: 5 },
  ]

  expect(remove(arr, item)).toStrictEqual(expectedResult)
})

test("it should cycle an index forwards, wrapping at the end", () => {
  expect(cycleIndex(0, 3, 1)).toBe(1)
  expect(cycleIndex(2, 3, 1)).toBe(0)
})

test("it should cycle an index backwards, wrapping at the start", () => {
  expect(cycleIndex(1, 3, -1)).toBe(0)
  expect(cycleIndex(0, 3, -1)).toBe(2)
})

test("it should cycle an index by more than its length", () => {
  expect(cycleIndex(0, 3, 5)).toBe(2)
  expect(cycleIndex(0, 3, -5)).toBe(1)
})
