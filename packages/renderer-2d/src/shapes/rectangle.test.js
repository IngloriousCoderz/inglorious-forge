import { anchorMargins } from "@inglorious/engine/physics/anchor.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { expect, test } from "vitest"

import { renderRectangle } from "./rectangle.js"

const X = 0
const Y = 1
const ORIGIN = 0
const api = { getType: () => ({ get: () => ({ id: "tile" }), load() {} }) }

function createContext() {
  let m = [1, 0, 0, 1, 0, 0]
  const stack = []
  const calls = []
  const record =
    (name) =>
    (...args) =>
      calls.push([name, ...args])
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
  const apply = ([x, y]) => [
    m[0] * x + m[2] * y + m[4],
    m[1] * x + m[3] * y + m[5],
  ]
  const boxOf = (x, y, w, h) => {
    const corners = [
      apply([x, y]),
      apply([x + w, y]),
      apply([x, y + h]),
      apply([x + w, y + h]),
    ]
    return {
      left: Math.min(...corners.map(([cx]) => cx)),
      right: Math.max(...corners.map(([cx]) => cx)),
      top: Math.min(...corners.map(([, cy]) => cy)),
      bottom: Math.max(...corners.map(([, cy]) => cy)),
    }
  }

  return {
    calls,
    ctx: {
      save: (...args) => {
        record("save")(...args)
        stack.push(m)
      },
      restore: (...args) => {
        record("restore")(...args)
        m = stack.pop()
      },
      translate: (x, y) => {
        record("translate")(x, y)
        multiply([1, 0, 0, 1, x, y])
      },
      scale: (x, y) => {
        record("scale")(x, y)
        multiply([x, 0, 0, y, 0, 0])
      },
      fillRect: (x, y, w, h) => (calls.box = boxOf(x, y, w, h)),
      strokeRect: (x, y, w, h) => (calls.box = boxOf(x, y, w, h)),
      drawImage: (...args) => {
        calls.push(["drawImage", ...args])
        const [dx, dy, dw, dh] = args.slice(5)
        calls.box = boxOf(dx, dy, dw, dh)
      },
    },
  }
}

// Renders through `absolutePosition`, the way the renderer does.
function draw(render, entity, position = [0, 0]) {
  const { calls, ctx } = createContext()
  ctx.save()
  ctx.translate(...position)
  render(entity, ctx, api)
  ctx.restore()
  return calls.box
}

const boxOf = (entity) => draw(renderRectangle, entity, entity.position)

const spriteOf = (entity) => draw(renderImage, entity, entity.position)

const ANCHORS = [
  ["centred", [0.5, 0.5]],
  ["bottom-left", [0, 0]],
  ["top-left", [0, 1]],
  ["bottom-right", [1, 0]],
]

test("it should straddle its position by default", () => {
  expect(boxOf({ size: [64, 16, 0] })).toMatchObject({
    left: -32,
    right: 32,
    top: -8,
    bottom: 8,
  })
})

test("it should still fall back to sensible defaults", () => {
  expect(boxOf({})).toMatchObject({
    left: -50,
    right: 50,
    top: -25,
    bottom: 25,
  })
})

test.each(ANCHORS)("a %s anchored box hangs off its position", (_, anchor) => {
  const { before, after } = anchorMargins(anchor, [64, 16, 0])
  const box = boxOf({ size: [64, 16, 0], anchor })

  expect(box).toMatchObject({
    left: ORIGIN - before[X],
    right: ORIGIN + after[X],
    top: ORIGIN - after[Y],
    bottom: ORIGIN + before[Y],
  })
})

test("an offset should still move a box", () => {
  expect(boxOf({ size: [10, 10, 0], offset: [5, 5, 0] })).toMatchObject({
    left: 0,
    right: 10,
    top: -10,
    bottom: 0,
  })
})

test.each(ANCHORS)(
  "a sprite and its box should agree with a %s anchor",
  (_, anchor) => {
    const entity = {
      size: [64, 16, 0],
      anchor,
      image: { id: "tile", imageSize: [64, 16], anchor },
    }

    expect(boxOf(entity)).toStrictEqual(spriteOf(entity))
  },
)

test("a sprite should keep a box on it even without an entity anchor", () => {
  const entity = {
    size: [64, 16, 0],
    image: { id: "tile", imageSize: [64, 16], anchor: [0, 1] },
  }

  expect(boxOf(entity)).toStrictEqual(spriteOf(entity))
})

test("it should draw at full opacity by default", () => {
  const { ctx } = createContext()

  renderRectangle({ size: [10, 10, 0] }, ctx)

  expect(ctx.globalAlpha).toBe(1)
})

test("it should draw at the given opacity", () => {
  const { ctx } = createContext()

  renderRectangle({ size: [10, 10, 0], opacity: 0.5 }, ctx)

  expect(ctx.globalAlpha).toBe(0.5)
})
