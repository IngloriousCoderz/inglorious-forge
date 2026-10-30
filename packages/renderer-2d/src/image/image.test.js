import { expect, test } from "vitest"

import { renderImage } from "./image.js"

const image = { id: "pipe", imageSize: [70, 288] }

const loaded = {
  id: "pipe",
  complete: true,
  naturalWidth: 70,
  naturalHeight: 288,
}
const api = { getType: () => ({ get: () => loaded }) }

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

test("it should read the image from where the frame says", () => {
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, tileSize: [70, 32], y: 128 } }, ctx, api)

  expect(drawArgs(calls)).toStrictEqual([0, 128, 70, 32, 0, 0, 70, 32])
})

test("it should read only a part of a tile", () => {
  const { calls, ctx } = createContext()

  renderImage(
    {
      image: {
        ...image,
        tileSize: [32, 16],
        frameSize: [64, 10],
        imageSize: [64, 10],
        x: 32,
        y: 64,
      },
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

  expect(calls.find(([name]) => name === "translate")).toStrictEqual([
    "translate",
    -0,
    -10,
  ])
})

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
  const { calls, ctx } = createContext()

  renderImage({ image: { ...image, scale: [2, 3], anchor: [0, 0] } }, ctx, api)

  const scales = calls.filter(([name]) => name === "scale")
  const translate = calls.find(([name]) => name === "translate")

  expect(scales).toStrictEqual([["scale", 2, 3]])
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

const tintedCanvas = () => {
  const composited = []

  return {
    width: 8,
    height: 8,
    composited,
    getContext: () => ({
      globalCompositeOperation: "source-over",
      fillStyle: "",
      drawImage() {},
      fillRect() {
        composited.push(this.fillStyle)
      },
      getImageData: () => ({ data: [1, 2, 3, 0] }),
    }),
  }
}

const withDocument = (make) => {
  const previous = globalThis.document

  globalThis.document = { createElement: () => make() }

  return () => {
    globalThis.document = previous
  }
}

test("it should draw an image in the colour it is given", () => {
  const { calls, ctx } = createContext()
  const copy = tintedCanvas()
  const restore = withDocument(() => copy)

  renderImage({ image, tint: "rgb(1, 2, 3)" }, ctx, api)

  expect(calls.find(([name]) => name === "drawImage")[1]).toBe(copy)
  restore()
})

test("it should draw a tinted frame whole rather than cutting it out again", () => {
  const { calls, ctx } = createContext()
  const restore = withDocument(() => tintedCanvas())

  renderImage(
    {
      image: {
        ...image,
        imageSize: [192, 256],
        tileSize: [32, 16],
        frameSize: [8, 8],
      },
      sx: 3,
      sy: 3,
      size: [8, 8, 0],
      anchor: [0, 1],
      tint: "rgb(1, 2, 3)",
    },
    ctx,
    api,
  )

  const drawn = calls.filter(([name]) => name === "drawImage").pop()

  expect(drawn.slice(2)).toStrictEqual([0, 0, 8, 8])
  restore()
})

test("it should keep the shape of the image it tinted", () => {
  const { ctx } = createContext()
  const copy = tintedCanvas()
  const restore = withDocument(() => copy)

  renderImage({ image, tint: "rgb(1, 2, 3)" }, ctx, api)

  expect(copy.getContext().getImageData(0, 0, 1, 1).data[3]).toBe(0)
  restore()
})

test("it should draw the same tinted frame once", () => {
  const { calls, ctx } = createContext()
  const copy = tintedCanvas()
  const restore = withDocument(() => copy)

  renderImage({ image, tint: "rgb(4, 5, 6)" }, ctx, api)
  renderImage({ image, tint: "rgb(4, 5, 6)" }, ctx, api)

  expect(copy.composited).toStrictEqual(["rgb(4, 5, 6)"])
  expect(calls.filter(([name]) => name === "drawImage")).toHaveLength(2)
  restore()
})

test("it should tint each colour it is asked for separately", () => {
  const made = []
  const restore = withDocument(() => {
    const copy = tintedCanvas()
    made.push(copy)
    return copy
  })
  const { ctx } = createContext()

  renderImage({ image, tint: "red" }, ctx, api)
  renderImage({ image, tint: "blue" }, ctx, api)

  expect(made).toHaveLength(2)
  restore()
})

test("it should not take a number in color for a tint", () => {
  const { calls, ctx } = createContext()
  const restore = withDocument(() => tintedCanvas())

  renderImage({ image, color: 4 }, ctx, api)

  expect(calls.find(([name]) => name === "drawImage")[1]).toStrictEqual({
    ...loaded,
  })
  restore()
})

test("it should share a tinted frame between engines", () => {
  const made = []
  const restore = withDocument(() => {
    const copy = tintedCanvas()
    made.push(copy)
    return copy
  })

  const first = createContext()
  const second = createContext()

  const oneEngine = { getType: () => ({ get: () => loaded }) }
  const anotherEngine = { getType: () => ({ get: () => loaded }) }

  renderImage({ image, tint: "rgb(9, 9, 9)" }, first.ctx, oneEngine)
  renderImage({ image, tint: "rgb(9, 9, 9)" }, second.ctx, anotherEngine)
  renderImage({ image, tint: "rgb(9, 9, 9)" }, second.ctx, anotherEngine)

  expect(made).toHaveLength(1)

  restore()
})

test("it should leave an untinted image alone", () => {
  const { calls, ctx } = createContext()

  renderImage({ image }, ctx, api)

  expect(calls.find(([name]) => name === "drawImage")[1]).toStrictEqual({
    ...loaded,
  })
})

test("it should draw only an image that has finished loading", () => {
  const { calls, ctx } = createContext()
  const previous = globalThis.document

  globalThis.document = {
    getElementById: () => ({ id: "cat", complete: false, src: "cat.png" }),
  }

  renderImage({ image: { ...image, id: "cat" } }, ctx, {
    getType: () => ({ get: () => undefined }),
  })

  expect(calls.some(([name]) => name === "drawImage")).toBe(false)

  globalThis.document = previous
})
