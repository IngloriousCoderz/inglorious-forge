import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "./test/canvas.js"

const SIXTY_FPS = 1 / 60
const THIRTY_FPS = 1 / 30

test("it should say the frame rate the game is running at", () => {
  const [, said] = callsTo(drawing({ value: SIXTY_FPS }), "fillText")[0]

  expect(said).toBe("FPS: 60")
})

test("it should say it as a rate and not as a time", () => {
  // The value is the length of a frame, so a longer frame is a slower rate.
  const [, said] = callsTo(drawing({ value: THIRTY_FPS }), "fillText")[0]

  expect(said).toBe("FPS: 30")
})

test("it should round to the accuracy it was asked for", () => {
  const [, whole] = callsTo(
    drawing({ value: SIXTY_FPS, accuracy: 0 }),
    "fillText",
  )[0]
  const [, toTwoPlaces] = callsTo(
    drawing({ value: 1 / 59.5, accuracy: 2 }),
    "fillText",
  )[0]

  expect(whole).toBe("FPS: 60")
  expect(toTwoPlaces).toBe("FPS: 59.50")
})

/** What the counter asks a canvas to do. */
function drawing(dt) {
  const { calls, ctx } = createContext()

  renderFps({ ...{}, dt }, ctx)

  return calls
}
