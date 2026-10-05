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

test("it should draw the whole image centred by default", () => {
  const { calls, ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(calls.map(([name]) => name)).toStrictEqual([
    "save",
    "translate",
    "drawImage",
    "restore",
  ])
  expect(calls[1]).toStrictEqual(["translate", -35, -144])
  expect(drawArgs(calls)).toStrictEqual([0, 0, 70, 288, 0, 0, 70, 288])
})

test("it should crop the image to a tile", () => {
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, tileSize: [70, 32] }, sy: 4 }, ctx, api)

  expect(drawArgs(calls)).toStrictEqual([0, 128, 70, 32, 0, 0, 70, 32])
})

// Artwork is not always one piece per cell: a sprite can be wider than the grid it
// is cut from, or sit inside its cell with background around it. `frameSize` is how
// much of the sheet to read, and `imageSize` is still the size it is drawn at.
test("it should read only a part of a tile", () => {
  const { calls, ctx } = createContext()

  renderImage(
    {
      image: {
        ...image,
        tileSize: [32, 16],
        frameSize: [64, 10],
        imageSize: [64, 10],
      },
      sx: 1,
      sy: 4,
    },
    ctx,
    api,
  )

  expect(drawArgs(calls)).toStrictEqual([32, 64, 64, 10, 0, 0, 64, 10])
})

test("it should draw a partial frame at its image size, not the tile size", () => {
  const { calls, ctx } = createContext()

  renderImage(
    {
      image: {
        id: "pipe",
        tileSize: [32, 16],
        frameSize: [64, 10],
        imageSize: [64, 10],
      },
      sx: 1,
      sy: 4,
      anchor: [0, 0],
    },
    ctx,
    api,
  )

  // Anchors count from the bottom, so a bottom-anchored box is drawn above the
  // position, which is negative on the canvas. The offset is the height of the
  // art rather than the height of the cell it was cut from.
  expect(calls.find(([name]) => name === "translate")).toStrictEqual([
    "translate",
    -0,
    -10,
  ])
})

// Anchors count from the bottom of the tile, so a bottom-anchored tile is drawn
// above the position, which is the negative half of the canvas.
const ANCHORS = [
  ["bottom-left", [0, 0], 0, 70, -288, 0],
  ["bottom-right", [1, 0], -70, 0, -288, 0],
  ["top-left", [0, 1], 0, 70, 0, 288],
  ["top-right", [1, 1], -70, 0, 0, 288],
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

  renderImage({ flipX: true, image: { ...image, anchor: [0, 0] } }, ctx, api)

  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([
    ["scale", -1, 1],
  ])
  expect(calls.box).toMatchObject({ left: 0, right: 70, top: -288, bottom: 0 })
})

test("it should draw at its native size by default", () => {
  const { calls, ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([])
})

test("it should scale the tile about the anchored point", () => {
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, scale: 4 } }, ctx, api)

  // Scaling happens after the anchor translate, so the anchored point stays put.
  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([
    ["scale", 4, 4],
  ])
})

test("it should draw at full opacity by default", () => {
  const { ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(ctx.globalAlpha).toBe(1)
})

test("it should draw at the given opacity", () => {
  const { ctx } = createContext()

  renderImage({ image, opacity: 0.25 }, ctx, api)

  expect(ctx.globalAlpha).toBe(0.25)
})

test("it should not mirror the image by default", () => {
  const { calls, ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([])
})

test("an entity anchor should place the sprite", () => {
  expect(tileBox({ anchor: [0, 0], image })).toStrictEqual({
    left: 0,
    right: 70,
    top: -288,
    bottom: 0,
  })
})

test("an entity anchor and an image anchor should agree", () => {
  const entity = { anchor: [0, 0], image: { ...image, anchor: [0, 0] } }

  expect(tileBox(entity)).toStrictEqual(
    tileBox({ ...entity, anchor: undefined }),
  )
})

test("an entity anchor should win over an image anchor", () => {
  const entity = { anchor: [0, 1], image: { ...image, anchor: [0, 0] } }

  expect(tileBox(entity)).toStrictEqual({
    left: 0,
    right: 70,
    top: 0,
    bottom: 288,
  })
})

test("a scaled tile should keep its anchored point on the position", () => {
  // Scaling has to come before the anchor translate, or the tile is placed against
  // its unscaled size and then scaled out from under the anchor.
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, scale: [2, 3], anchor: [0, 0] } }, ctx, api)

  const scales = calls.filter(([name]) => name === "scale")
  const translate = calls.find(([name]) => name === "translate")

  expect(scales).toStrictEqual([["scale", 2, 3]])
  // Scaled: a 70x288 tile at [0, 0] reaches 140 across and 864 up from the origin.
  expect(calls.box).toMatchObject({ left: 0, right: 140, top: -864, bottom: 0 })
  expect(translate).toBeDefined()
})

test("a scaled tile should scale each axis on its own", () => {
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, scale: [2, 3] } }, ctx, api)

  expect(calls.filter(([name]) => name === "scale")).toStrictEqual([
    ["scale", 2, 3],
  ])
})
