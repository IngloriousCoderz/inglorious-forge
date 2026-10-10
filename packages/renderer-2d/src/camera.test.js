import { renderCamera } from "@inglorious/renderer-2d/camera.js"
import { expect, test } from "vitest"

import { createContext } from "./test/canvas.js"

const A_VIEWPORT = [800, 600]

test("it should be drawn when the game is in dev mode", () => {
  // The camera is not really a thing on screen -- its properties move the world around it.
  // In dev mode its viewport is outlined so you can see where that is.
  const { calls, ctx } = createContext()

  renderCamera({ size: A_VIEWPORT }, ctx, inDevMode(true))

  expect(calls.some(([name]) => name === "fillRect")).toBe(true)
})

test("it should not be drawn when the game is not in dev mode", () => {
  const { calls, ctx } = createContext()

  renderCamera({ size: A_VIEWPORT }, ctx, inDevMode(false))

  expect(calls).toEqual([])
})

test("it should be drawn at the size of the viewport it moves the world around", () => {
  const { calls, ctx } = createContext()

  renderCamera({ size: A_VIEWPORT }, ctx, inDevMode(true))

  const { left, right, top, bottom } = calls.box

  expect([left, right]).toEqual([-A_VIEWPORT[0] / 2, A_VIEWPORT[0] / 2])
  expect([top, bottom]).toEqual([-A_VIEWPORT[1] / 2, A_VIEWPORT[1] / 2])
})

function inDevMode(devMode) {
  return { getEntity: () => ({ devMode }) }
}
