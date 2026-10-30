import { expect, test } from "vitest"

import { renderSprite } from "./sprite.js"

/** Records where the canvas had been moved to each time a tile was asked for. */
function createContext() {
  let m = [1, 0, 0, 1, 0, 0]
  const stack = []
  const drawn = []
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

  return {
    drawn,
    save: () => stack.push(m),
    restore: () => {
      m = stack.pop()
    },
    scale: (x, y) => multiply([x, 0, 0, y, 0, 0]),
    translate: (x, y) => multiply([1, 0, 0, 1, x, y]),
    drawImage: (img, sx, sy) => drawn.push([sx, sy, m[4], m[5]]),
    get globalAlpha() {
      return 1
    },
    set globalAlpha(_) {},
  }
}

const api = { getType: () => ({ get: () => ({ id: "dungeonCharacter" }) }) }

const player = (state = "right", value = 0) => ({
  sprite: {
    image: {
      id: "dungeonCharacter",
      imageSize: [112, 64],
      tileSize: [16, 16],
    },
    frames: { right: [17], left: [-2147483631] },
    state,
    value,
    scale: 1,
  },
})

test("it should draw a sprite around the entity's own middle", () => {
  const ctx = createContext()

  renderSprite(player(), ctx, api)

  const [, , x, y] = ctx.drawn[0]

  expect([x, y]).toStrictEqual([-8, -8])
})

test("it should crop the tile its frame names, flipped or not", () => {
  const flipped = createContext()

  renderSprite(player("left"), flipped, api)

  expect(flipped.drawn[0].slice(0, 2)).toStrictEqual([48, 32])
})
