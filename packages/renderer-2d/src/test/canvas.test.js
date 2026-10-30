import { expect, test } from "vitest"

import { callsTo, createContext } from "./canvas.js"

const IMAGE = {}
const A_QUARTER_TURN = Math.PI / 2

test("it should remember what it was asked to do, name first", () => {
  const { calls, ctx } = createContext()

  ctx.moveTo(1, 2)
  ctx.lineTo(3, 4)

  expect(calls).toEqual([
    ["moveTo", 1, 2],
    ["lineTo", 3, 4],
  ])
})

test("it should remember calls of one kind in the order they happened", () => {
  const { calls, ctx } = createContext()

  ctx.fillRect(0, 0, 1, 1)
  ctx.fillStyle = "red"
  ctx.fillRect(2, 2, 3, 3)

  expect(callsTo(calls, "fillRect")).toEqual([
    ["fillRect", 0, 0, 1, 1],
    ["fillRect", 2, 2, 3, 3],
  ])
})

test("it should still pick calls out after it has measured a box", () => {
  const { calls, ctx } = createContext()

  ctx.fillRect(0, 0, 1, 1)

  expect(callsTo(calls, "fillRect").length).toBe(1)
})

test("it should remember colours and widths when they are set", () => {
  const { calls, ctx } = createContext()

  ctx.fillStyle = "red"
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.5

  expect(callsTo(calls, "fillStyle")[0]).toEqual(["fillStyle", "red"])
  expect(callsTo(calls, "lineWidth")[0]).toEqual(["lineWidth", 3])
  expect(callsTo(calls, "globalAlpha")[0]).toEqual(["globalAlpha", 0.5])
})

test("it should say where a point lands once it has been moved", () => {
  const { at, ctx } = createContext()

  ctx.translate(10, 20)

  expect(at([1, 2])).toEqual([11, 22])
})

test("it should say where a point lands once it has been turned", () => {
  const { at, ctx } = createContext()

  ctx.rotate(A_QUARTER_TURN)

  expect(at([1, 0])[1]).toBeCloseTo(1, 9)
  expect(at([0, 1])[0]).toBeCloseTo(-1, 9)
})

test("it should say where a point lands once it has been made bigger", () => {
  const { at, ctx } = createContext()

  ctx.scale(2, 3)

  expect(at([1, 1])).toEqual([2, 3])
})

test("it should forget a transform once it is put back", () => {
  const { at, ctx } = createContext()

  ctx.save()
  ctx.translate(10, 20)

  ctx.restore()

  expect(at([1, 2])).toEqual([1, 2])
})

test("it should put back only the transform it was given, not the one before that", () => {
  const { at, ctx } = createContext()

  ctx.translate(10, 0)
  ctx.save()
  ctx.translate(0, 10)
  ctx.restore()

  expect(at([0, 0])).toEqual([10, 0])
})

test("it should measure a box once the transform is applied", () => {
  const { box } = boxOf((ctx) => {
    ctx.translate(10, 20)
    ctx.fillRect(0, 0, 30, 40)
  })

  expect(box).toEqual({ left: 10, right: 40, top: 20, bottom: 60 })
})

test("it should measure a box that has been turned", () => {
  const { box } = boxOf((ctx) => {
    ctx.rotate(A_QUARTER_TURN)
    ctx.fillRect(0, 0, 10, 4)
  })

  expect(box.left).toBeCloseTo(-4, 9)
  expect(box.right).toBeCloseTo(0, 9)
  expect(box.top).toBeCloseTo(0, 9)
  expect(box.bottom).toBeCloseTo(10, 9)
})

test("it should measure a drawn image by where it lands", () => {
  const { box } = boxOf((ctx) => {
    ctx.drawImage(IMAGE, 0, 0, 16, 16, 100, 200, 30, 40)
  })

  expect(box).toEqual({ left: 100, right: 130, top: 200, bottom: 240 })
})

/** The last box measured, after whatever the drawing did. */
function boxOf(draw) {
  const { calls, ctx } = createContext()

  draw(ctx)

  return { box: calls.box, ctx }
}
