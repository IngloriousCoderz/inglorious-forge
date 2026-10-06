import { expect, test } from "vitest"

import { rendering } from "./rendering-behavior.js"

/** A canvas that records what was drawn on it, so the last thing drawn can be asked. */
function createCanvas() {
  const operations = []

  // One context, handed out however many times it is asked for, so that what the
  // behaviour set on it can be read back.
  const ctx = {
    fillStyle: undefined,
    fillRect() {
      operations.push(`fillRect(${ctx.fillStyle})`)
    },
  }

  const canvas = {
    style: {},
    width: 320,
    height: 240,
    operations,
    ctx,
    addEventListener() {},
    removeEventListener() {},
    getContext: () => ctx,
  }

  return canvas
}

const api = (game) => ({
  getEntity: (id) => (id === "game" ? game : undefined),
})

test("it should stop showing a game that has quit", () => {
  // Stopping the loop is not enough on its own: nothing draws any more, so the canvas
  // keeps the last frame of a finished game and it looks paused rather than over.
  const canvas = createCanvas()
  const behaviour = rendering(canvas)

  behaviour.quit(undefined, undefined, api({ size: [320, 240] }))

  expect(canvas.operations).toHaveLength(1)
  expect(canvas.operations[0]).toMatch(/^fillRect\(lightgrey\)$/)
})

test("it should paint the quit with the game's own background", () => {
  const canvas = createCanvas()
  const behaviour = rendering(canvas)

  behaviour.quit(
    undefined,
    undefined,
    api({ size: [320, 240], backgroundColor: "rgb(1, 2, 3)" }),
  )

  expect(canvas.operations[0]).toBe("fillRect(rgb(1, 2, 3))")
})
