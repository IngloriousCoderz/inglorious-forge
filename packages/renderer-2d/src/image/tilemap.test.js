import { expect, test, vi } from "vitest"

import { renderTilemap } from "./tilemap.js"

/**
 * A context that composes the transform the way the canvas does, so a test can say
 * where a tile actually lands rather than which calls were made.
 */
function createContext() {
  let m = [1, 0, 0, 1, 0, 0]
  const stack = []
  const calls = []
  // Canvas composes as `current * next`, with column vectors.
  const multiply = (n) => {
    const [a, b, c, d, e, f] = m
    const [A, B, C, D, E, F] = n

    m = [
      a * A + c * B,
      b * A + d * B,
      a * C + c * D,
      b * C + d * D,
      a * E + c * F + e,
      b * E + d * F + f,
    ]
  }
  const ctx = {
    calls,
    save: () => stack.push(m),
    restore: () => {
      m = stack.pop()
    },
    scale: (...args) => multiply([args[0], 0, 0, args[1], 0, 0]),
    translate: (...args) => multiply([1, 0, 0, 1, args[0], args[1]]),
    // A tile is positioned by the transform, not by the box `drawImage` is given, so
    // what matters is where the canvas has been moved to when the tile is asked for.
    drawImage: (img, ...args) => calls.push([args[0], args[1], m[4], m[5]]),
    fillRect: () => {},
    strokeRect: () => {},
    get fillStyle() {
      return ""
    },
    set fillStyle(_) {},
    get globalAlpha() {
      return 1
    },
    set globalAlpha(_) {},
  }

  return ctx
}

const api = { getType: () => ({ get: () => ({ id: "dungeon" }) }) }

const tilemap = (tiles, columns = 2) => ({
  image: { id: "dungeon", imageSize: [64, 64], tileSize: [16, 16] },
  columns,
  layers: [{ tiles }],
})

/** The sheet crop of each tile, and where the canvas had been moved to for it. */
function drawnAt(ctx) {
  return ctx.calls
}

test("it should draw the first tile centred on the middle of its own cell", () => {
  const ctx = createContext()

  // Two columns of two rows, so the map is 32 wide and 32 tall.
  renderTilemap({ tilemap: tilemap([0, 1, 2, 3]) }, ctx, api)

  // The map is centred on the origin, so the top left cell's middle is a quarter of
  // the map up and to the left of it. The crop of a 16px tile drawn around that middle
  // starts half a tile before it, which is the corner of the cell.
  // The sheet crop is the top left tile, and it is drawn into the corner of the top
  // left cell, which sits a quarter of the map up and to the left of the origin.
  expect(drawnAt(ctx)[0]).toStrictEqual([0, 0, -16, -16])
  expect(drawnAt(ctx)[0].slice(2)).toStrictEqual([-16, -16])
})

test("it should draw every tile in its own cell", () => {
  const ctx = createContext()

  renderTilemap({ tilemap: tilemap([0, 1, 2, 3]) }, ctx, api)

  // One tile across from the other, and one down: 16px apart on each axis.
  const [first, second] = drawnAt(ctx)

  // One tile across is 16px away on the x axis, and none on the y axis.
  expect([second[2] - first[2], second[3] - first[3]]).toStrictEqual([16, 0])
})
