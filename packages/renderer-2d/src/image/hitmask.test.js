import { renderHitmask } from "@inglorious/renderer-2d/image/hitmask.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "../test/canvas.js"

const TILE = [16, 16]
const COLUMNS = 4

// A hitmask draws a column of tiles per column, each tinted by how tall that column is --
// so the shape of the terrain can be seen without playing it.
const aLevel = (heights) => ({ tileSize: TILE, columns: COLUMNS, heights })

test("it should draw one tile per column", () => {
  const calls = drawing(aLevel([1, 2, 3, 4]))

  expect(callsTo(calls, "fillRect").length).toBe(4)
})

test("it should spread the columns across the width it was given", () => {
  // A row of tiles centred on the position, so the level straddles it rather than starting
  // at it. The box of the whole thing is the first tile's left to the last tile's right.
  const [left, right] = tileSpan(aLevel([1, 2, 3, 4]), "x")

  expect([left, right]).toEqual([
    -(COLUMNS * TILE[0]) / 2,
    (COLUMNS * TILE[0]) / 2,
  ])
})

test("it should lay the columns out in rows when there are more than fit across", () => {
  // Four across, so eight columns of terrain are two rows deep rather than one long one.
  const eight = [1, 2, 3, 4, 5, 6, 7, 8]
  const rows = new Set(
    callsTo(drawing(aLevel(eight)), "fillRect").map(([, , y]) => y),
  )

  expect(rows.size).toBe(2)
})

test("it should be one row deep when the columns fit across", () => {
  const rows = new Set(
    callsTo(drawing(aLevel([1, 2, 3, 4])), "fillRect").map(([, , y]) => y),
  )

  expect(rows.size).toBe(1)
})

test("it should tint a tall column differently from a short one", () => {
  // The tint is the height turned into a hue, and the whole point of the drawing is being
  // able to read the shape of the terrain off it.
  const [tintOf] = callsTo(drawing(aLevel([1, 10])), "fillStyle")

  expect(tintOf[1]).toMatch(/^hsla\(/)
  expect(tintOf[1]).not.toBe(
    callsTo(drawing(aLevel([10, 1])), "fillStyle")[0][1],
  )
})

test("it should not let a level of one height take the top off every one of them", () => {
  // A flat level has nothing to normalise against, and dividing by nothing would put every
  // hue at nothing.
  const [tintOf] = callsTo(drawing(aLevel([5, 5, 5, 5])), "fillStyle")

  expect(tintOf[1]).toMatch(/^hsla\(/)
})

test("it should draw the tilemap in the collision docs", () => {
  // `docs/engine/src/collision/tilemap.js` draws a dungeon with these very numbers, and the
  // docs are read far more often than this file is, so a change that breaks them should
  // break here first: five rows of six, walled in, 48 by 48 tiles.
  const dungeon = [
    2, 2, 2, 2, 2, 2, 2, 0, 1, 0, 0, 2, 2, 0, 0, 1, 0, 2, 2, 0, 0, 0, 0, 2, 2,
    2, 2, 2, 2, 2,
  ]

  const calls = drawing({ tileSize: [48, 48], columns: 6, heights: dungeon })

  expect(callsTo(calls, "fillRect").length).toBe(30)
  expect(new Set(callsTo(calls, "fillRect").map(([, , y]) => y)).size).toBe(5)
})

/** Where the first and last tile sit along one axis, offsets applied. */
function tileSpan(entity, axis) {
  const calls = drawing(entity)
  const offset = callsTo(calls, "translate")[0]
  const tiles = callsTo(calls, "fillRect")
  const from = (column) => offset[axis === "x" ? 1 : 2] + column

  return [from(tiles[0][1]), from(tiles.at(-1)[1]) + TILE[0]]
}

/** What a hitmask asks a canvas to do. */
function drawing(entity) {
  const { calls, ctx } = createContext()

  renderHitmask(entity, ctx)

  return calls
}
