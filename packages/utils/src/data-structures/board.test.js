import { expect, test } from "vitest"

import { mod } from "../math/numbers.js"
import {
  createBoard,
  down,
  downLeft,
  downRight,
  left,
  neighbors,
  right,
  toString,
  up,
  upLeft,
  upRight,
} from "./board.js"

test("it should create an empty board", () => {
  const size = [4, 4]
  const expectedResult = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]

  expect(createBoard(size)).toStrictEqual(expectedResult)
})

test("it should create a checkerboard", () => {
  const size = [4, 4]
  const filler = (i, j) => (!mod(i + j, 2) ? 1 : 0)
  const expectedResult = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1]

  expect(createBoard(size, filler)).toStrictEqual(expectedResult)
})

test("it should return the coordinates of the cell downward", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [4, 4]

  expect(down(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should throw going down if cell is downmost", () => {
  const size = [8, 8]
  const coordinates = [7, 4]

  expect(() => down(coordinates, size)).toThrow()
})

test("it should return the coordinates of the cell down left", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [4, 3]

  expect(downLeft(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should throw going down left if cell is downmost", () => {
  const size = [8, 8]
  const coordinates = [7, 4]

  expect(() => downLeft(coordinates, size)).toThrow()
})

test("it should throw going down left if cell is downmost", () => {
  const size = [8, 8]
  const coordinates = [3, 0]

  expect(() => downLeft(coordinates, size)).toThrow()
})

test("it should throw going down left if cell is on the angle", () => {
  const size = [8, 8]
  const coordinates = [7, 0]

  expect(() => downLeft(coordinates, size)).toThrow()
})

test("it should return the coordinates of the cell down right", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [4, 5]

  expect(downRight(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should throw going down right if cell is downmost", () => {
  const size = [8, 8]
  const coordinates = [7, 4]

  expect(() => downRight(coordinates, size)).toThrow()
})

test("it should throw going down right if cell is downmost", () => {
  const size = [8, 8]
  const coordinates = [3, 7]

  expect(() => downRight(coordinates, size)).toThrow()
})

test("it should throw going down right if cell is on the angle", () => {
  const size = [8, 8]
  const coordinates = [7, 7]

  expect(() => downRight(coordinates, size)).toThrow()
})

test("it should return the coordinates of the cell to the left", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [3, 3]

  expect(left(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should not return coordinates to the left if cell is leftmost", () => {
  const size = [8, 8]
  const coordinates = [3, 0]

  expect(() => left(coordinates, size)).toThrow()
})

test("it should return the coordinates neighboring an interior cell", () => {
  const size = [4, 5]
  const coordinates = [2, 3]
  const expectedResult = [
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 2],
    [2, 4],
    [3, 2],
    [3, 3],
    [3, 4],
  ]

  expect(neighbors(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should return only existing coordinates neighboring a corner cell", () => {
  const size = [4, 5]
  const coordinates = [0, 4]
  const expectedResult = [
    [0, 3],
    [1, 3],
    [1, 4],
  ]

  expect(neighbors(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should return no neighbors for a board with one cell", () => {
  const size = [1, 1]
  const coordinates = [0, 0]
  const expectedResult = []

  expect(neighbors(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should return the coordinates of the cell to the right", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [3, 5]

  expect(right(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should not return coordinates to the right if cell is rightmost", () => {
  const size = [8, 8]
  const coordinates = [3, 7]

  expect(() => right(coordinates, size)).toThrow()
})

test("it should return a string representation of the given board", () => {
  const board = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1]

  expect(toString(board, [4, 4])).toBe(`1 0 1 0
0 1 0 1
1 0 1 0
0 1 0 1`)
})

test("it should return a custom string representation of the given board", () => {
  const board = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1]
  const cellToString = (cell) => cell.toFixed(1)

  expect(toString(board, [4, 4], cellToString)).toBe(`1.0 0.0 1.0 0.0
0.0 1.0 0.0 1.0
1.0 0.0 1.0 0.0
0.0 1.0 0.0 1.0`)
})

test("it should return the coordinates of the cell upward", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [2, 4]

  expect(up(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should throw going upward if cell is topmost", () => {
  const size = [8, 8]
  const coordinates = [0, 4]

  expect(() => up(coordinates, size)).toThrow()
})

test("it should return the coordinates of the cell up left", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [2, 3]

  expect(upLeft(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should throw going up left if cell is upmost", () => {
  const size = [8, 8]
  const coordinates = [0, 4]

  expect(() => upLeft(coordinates, size)).toThrow()
})

test("it should throw going up left if cell is leftmost", () => {
  const size = [8, 8]
  const coordinates = [3, 0]

  expect(() => upLeft(coordinates, size)).toThrow()
})

test("it should throw going up left if cell is on the angle", () => {
  const size = [8, 8]
  const coordinates = [0, 0]

  expect(() => upLeft(coordinates, size)).toThrow()
})

test("it should return the coordinates of the cell up right", () => {
  const size = [8, 8]
  const coordinates = [3, 4]
  const expectedResult = [2, 5]

  expect(upRight(coordinates, size)).toStrictEqual(expectedResult)
})

test("it should throw going up right if cell is upmost", () => {
  const size = [8, 8]
  const coordinates = [0, 4]

  expect(() => upRight(coordinates, size)).toThrow()
})

test("it should throw going down right if cell is rightmost", () => {
  const size = [8, 8]
  const coordinates = [3, 7]

  expect(() => upRight(coordinates, size)).toThrow()
})

test("it should throw going down right if cell is on the angle", () => {
  const size = [8, 8]
  const coordinates = [0, 7]

  expect(() => upRight(coordinates, size)).toThrow()
})
