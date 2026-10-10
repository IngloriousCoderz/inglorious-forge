import { infiniteLoop } from "@inglorious/renderer-2d/infinite-loop.js"
import { expect, test } from "vitest"

import { callsTo as recorded, createContext } from "./test/canvas.js"

const A_LOOP = [64, 32, 0]

test("it should draw the thing once when there is nothing to loop", () => {
  const drawn = drawing({ image: {} })

  expect(drawn).toBe(1)
})

test("it should draw the thing twice when there is a loop", () => {
  const drawn = drawing({ image: { loop: A_LOOP } })

  expect(drawn).toBe(2)
})

test("it should draw the second one shifted back by the loop", () => {
  // The second copy is drawn a whole loop's distance along, so that a sprite scrolling off
  // one side comes back in on the other without a seam.
  const { calls, ctx } = createContext()

  infiniteLoop(() => ctx.fillRect(0, 0, 10, 10))(entity, ctx)

  const [, x, y] = recorded(calls, "translate")[0]

  expect([x, y]).toEqual([-64, -32])
})

test("it should let go of the context between the two", () => {
  const { calls, ctx } = createContext()

  infiniteLoop(() => ctx.fillRect(0, 0, 10, 10))(entity, ctx)

  expect(calls.map(([name]) => name)).toEqual([
    "fillRect",
    "save",
    "translate",
    "fillRect",
    "restore",
  ])
})

const entity = { image: { loop: A_LOOP } }

/** How many times the thing was drawn. */
function drawing(entity) {
  const { ctx } = createContext()
  let drawn = 0

  infiniteLoop(() => {
    drawn += 1
    ctx.fillRect(0, 0, 10, 10)
  })(entity, ctx)

  return drawn
}
