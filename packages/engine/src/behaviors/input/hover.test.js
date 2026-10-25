import { createGame } from "@inglorious/engine/test.js"
import { beforeEach, describe, expect, test } from "vitest"

import { hover } from "./hover.js"
import { createMouseEntity, mouse } from "./mouse.js"

const ON_THE_BUTTON = [400, 0, 300]
const OFF_THE_BUTTON = [700, 0, 100]

describe("a hovering pointer", () => {
  let game

  beforeEach(() => {
    game = createGame({
      types: { Mouse: [mouse(), hover()], Button: {} },
      entities: {
        game: { type: "Game", size: [800, 600] },
        mouse: createMouseEntity({ cursor: "arrow" }),
        button: {
          type: "Button",
          position: ON_THE_BUTTON,
          size: [100, 0, 50],
          solid: true,
        },
      },
    })
  })

  test("it is an arrow when it is over nothing", () => {
    game.notify("mouseMove", OFF_THE_BUTTON).step()

    expect(game.entity("mouse").cursor).toBe("arrow")
  })

  test("it is a hand when it is over something pressable", () => {
    game.notify("mouseMove", ON_THE_BUTTON).step()

    expect(game.entity("mouse").cursor).toBe("hand")
  })

  test("it stays a hand while it is holding something", () => {
    // given a press on the button
    game.notify("mouseDown", ON_THE_BUTTON).step()
    expect(game.entity("mouse").cursor).toBe("hand")

    // when the pointer wanders off with the button still held down
    game.notify("mouseMove", OFF_THE_BUTTON).step()

    // then it does not flicker back mid-drag
    expect(game.entity("mouse").cursor).toBe("hand")
  })

  test("letting go puts the arrow back", () => {
    game.notify("mouseDown", ON_THE_BUTTON).step()
    game.notify("mouseUp", OFF_THE_BUTTON).step()
    game.notify("mouseMove", OFF_THE_BUTTON).step()

    expect(game.entity("mouse").cursor).toBe("arrow")
  })

  test("it still moves the pointer about", () => {
    // The decorator hands on to whatever it displaced: skipping that would leave a
    // mouse that points at things without ever going to them.
    game.notify("mouseMove", ON_THE_BUTTON).step()

    expect(game.entity("mouse").position).toEqual(ON_THE_BUTTON)
  })

  test("a mouse with no cursor of its own gets the resting one", () => {
    game = createGame({
      types: { Mouse: [mouse(), hover()], Button: {} },
      entities: {
        game: { type: "Game", size: [800, 600] },
        mouse: createMouseEntity(),
      },
    })
    game.step()

    expect(game.entity("mouse").cursor).toBe("arrow")
  })

  test("it points how it was asked to away from anything pressable", () => {
    game = createGame({
      types: { Mouse: [mouse(), hover({ off: "crosshair" })], Button: {} },
      entities: {
        game: { type: "Game", size: [800, 600] },
        mouse: createMouseEntity({ cursor: "crosshair" }),
      },
    })

    game.notify("mouseMove", OFF_THE_BUTTON).step()

    expect(game.entity("mouse").cursor).toBe("crosshair")
  })
})
