import { expect, test } from "vitest"

import { renderImage } from "./image.js"

const image = { id: "pipe", imageSize: [70, 288] }

const api = { getType: () => ({ get: () => ({ id: "pipe" }) }) }

const drawArgs = (calls) =>
  calls.find(([name]) => name === "drawImage").slice(2)

/**
 * A context that composes the transform matrix the way the canvas does, so that
 * a test can assert where a tile actually lands rather than which calls were
 * made.
 */
function createContext() {
  let m = [1, 0, 0, 1, 0, 0]
  const stack = []
  const calls = []
  const record =
    (name) =>
    (...args) =>
      calls.push([name, ...args])
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
  const apply = ([x, y]) => [
    m[0] * x + m[2] * y + m[4],
    m[1] * x + m[3] * y + m[5],
  ]

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
      drawImage: (...args) => {
        calls.push(["drawImage", ...args])
        const [dx, dy, dw, dh] = args.slice(5)
        const corners = [
          apply([dx, dy]),
          apply([dx + dw, dy]),
          apply([dx, dy + dh]),
          apply([dx + dw, dy + dh]),
        ]
        calls.box = {
          left: Math.min(...corners.map(([x]) => x)),
          top: Math.min(...corners.map(([, y]) => y)),
          right: Math.max(...corners.map(([x]) => x)),
          bottom: Math.max(...corners.map(([, y]) => y)),
        }
      },
    },
  }
}

// Renders the tile the way the renderer does, anchored at the entity position,
// and returns the box it covers in canvas space.
function tileBox(entity, position = [0, 0]) {
  const { calls, ctx } = createContext()
  const [x, y] = position
  ctx.save()
  ctx.translate(x, y)
  renderImage(entity, ctx, api)
  ctx.restore()
  return calls.box
}

test("it should draw the whole image from its top-left corner", () => {
  const { calls, ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(calls.map(([name]) => name)).toStrictEqual([
    "save",
    "translate",
    "drawImage",
    "restore",
  ])
  expect(calls[1]).toStrictEqual(["translate", -0, -0])
  expect(drawArgs(calls)).toStrictEqual([0, 0, 70, 288, 0, 0, 70, 288])
})

test("it should crop the image to a tile", () => {
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, tileSize: [70, 32] }, sy: 4 }, ctx, api)

  expect(drawArgs(calls)).toStrictEqual([0, 128, 70, 32, 0, 0, 70, 32])
})

const ANCHORS = [
  ["top-left", [0, 0], 0, 70, 0, 288],
  ["top-right", [1, 0], -70, 0, 0, 288],
  ["bottom-left", [0, 1], 0, 70, -288, 0],
  ["bottom-right", [1, 1], -70, 0, -288, 0],
  ["centred", [0.5, 0.5], -35, 35, -144, 144],
]

test.each(ANCHORS)(
  "it should grow the tile from its %s anchor",
  (_, anchor, left, right, top, bottom) => {
    expect(tileBox({ image: { ...image, anchor } })).toMatchObject({
      left,
      right,
      top,
      bottom,
    })
  },
)

test.each(ANCHORS)(
  "a mirrored tile should keep its %s anchor box",
  (_, anchor, left, right, top, bottom) => {
    const box = { left, right, top, bottom }

    expect(tileBox({ image: { ...image, anchor }, flipX: true })).toMatchObject(
      box,
    )
    expect(tileBox({ image: { ...image, anchor }, flipY: true })).toMatchObject(
      box,
    )
    expect(
      tileBox({ image: { ...image, anchor }, flipX: true, flipY: true }),
    ).toMatchObject(box)
  },
)

test("it should mirror the image on a single axis", () => {
  const { calls, ctx } = createContext()

  renderImage({ flipX: true, image: { ...image, anchor: [0, 1] } }, ctx, api)

  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([
    ["scale", -1, 1],
  ])
  expect(calls.box).toMatchObject({ left: 0, right: 70, top: -288, bottom: 0 })
})

test("it should not mirror the image by default", () => {
  const { calls, ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([])
})
