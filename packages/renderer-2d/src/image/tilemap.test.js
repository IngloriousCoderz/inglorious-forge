import { expect, test } from "vitest"

import { renderTilemap } from "./tilemap.js"

/**
 * A context that composes the transform the way the canvas does, so a test can say
 * where a tile actually lands rather than which calls were made.
 */
function createContext() {
  let m = [1, 0, 0, 1, 0, 0]
  const stack = []
  const calls = []
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

  renderTilemap({ tilemap: tilemap([0, 1, 2, 3]) }, ctx, api)

  expect(drawnAt(ctx)[0]).toStrictEqual([0, 0, -16, -16])
  expect(drawnAt(ctx)[0].slice(2)).toStrictEqual([-16, -16])
})

test("it should draw every tile in its own cell", () => {
  const ctx = createContext()

  renderTilemap({ tilemap: tilemap([0, 1, 2, 3]) }, ctx, api)

  const [first, second] = drawnAt(ctx)

  expect([second[2] - first[2], second[3] - first[3]]).toStrictEqual([16, 0])
})
