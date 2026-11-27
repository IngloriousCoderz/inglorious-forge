import { v } from "@inglorious/utils/v.js"
import { describe, expect, test } from "vitest"

import { createGame } from "../../test.js"
import { createGamepadEntity, gamepad } from "../input/gamepad.js"
import { createInputEntity, input } from "../input/input.js"
import { modernControls } from "./kinematic/modern.js"

describe("movement from a stick", () => {
  const X = 0

  function play() {
    return createGame({
      types: { Gamepad: gamepad(), Input: input(), Player: [modernControls()] },
      entities: {
        gamepad: createGamepadEntity({
          Axis0: "moveLeftRight",
          Btn0: "moveRight",
        }),
        input: createInputEntity(),
        game: { type: "Game", size: v(800, 600) },
        player: { type: "Player", position: v(400, 0, 300), maxSpeed: 100 },
      },
    })
  }

  test("a stick pushed left moves the player left", () => {
    const game = play()

    game.notify("gamepadAxis", { axis: "Axis0", value: -1 }).step(10)

    expect(game.entity("player").position[X]).toBeLessThan(400)
  })

  test("a stick let go stops the player", () => {
    const game = play()

    game.notify("gamepadAxis", { axis: "Axis0", value: 1 }).step(10)
    game.notify("gamepadAxis", { axis: "Axis0", value: 0 }).step()
    const [x] = game.entity("player").position
    game.step(10)

    expect(game.entity("player").position[X]).toBe(x)
  })

  test("a button still moves the player at full speed", () => {
    const game = play()

    game.notify("gamepadPress", { button: "Btn0" }).step(10)

    expect(game.entity("player").position[X]).toBeGreaterThan(400)
  })
})
