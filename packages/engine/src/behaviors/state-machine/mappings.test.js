import { createStore } from "@inglorious/store/store.js"
import { beforeEach, expect, test, vi } from "vitest"

import { gamepad } from "../input/gamepad.js"
import { keyboard } from "../input/keyboard.js"
import { fsm } from "./fsm.js"
import { mappings } from "./mappings.js"

// The keyboard reads the document when it is made. What is being tested is what it is
// told, not what it listens to.
beforeEach(() => {
  vi.stubGlobal("document", { body: {}, addEventListener: () => {} })

  return () => vi.unstubAllGlobals()
})

// A machine that moves, and the devices that answer to it. Written the way a game writes
// it, so that what is tested is what a game would actually get.
function world(keysByState) {
  const store = createStore({
    types: {
      Game: [
        mappings(keysByState),
        fsm({
          menu: {
            choose: (e) => {
              e.state = "play"
            },
          },
          play: {},
        }),
      ],
      Keyboard: [keyboard()],
      Gamepad: [gamepad()],
    },
    entities: {
      game: { type: "Game", state: "menu" },
      keyboard: { type: "Keyboard", mapping: { Enter: "nothing" } },
      gamepad: { type: "Gamepad", mapping: { Btn0: "nothing" } },
    },
  })

  return store
}

const mapping = (store, id) => store.getState()[id].mapping

test("it should give each state the mapping that state answers to", () => {
  const store = world({
    menu: { ArrowUp: "moveItemUp", Enter: "choose" },
    play: { ArrowLeft: "moveLeft" },
  })

  // The opening state counts: a machine is already in it when it is made, and nothing
  // announces that.
  store.update()
  expect(mapping(store, "keyboard")).toStrictEqual({
    ArrowUp: "moveItemUp",
    Enter: "choose",
  })

  store.notify("choose")
  store.update()

  expect(mapping(store, "keyboard")).toStrictEqual({ ArrowLeft: "moveLeft" })
})

test("it should leave a state with nothing mapped deaf rather than carrying on", () => {
  // The mistake this exists to prevent: a state nobody gave keys to going on answering
  // whatever the state before it set.
  const store = world({
    menu: { Enter: "choose" },
    credits: {},
  })

  store.update()
  store.getState().game.state = "credits"
  store.notify("stateChange", { entityId: "game", from: "menu", to: "credits" })
  store.update()

  expect(mapping(store, "keyboard")).toStrictEqual({})
})

test("it should reach every device that reads a mapping", () => {
  // One key cannot mean two things depending on which of them was pressed, so this has to
  // reach the gamepad as well as the keyboard -- and both are handed the same table,
  // which is where keys and buttons live together.
  const table = {
    ArrowUp: "moveItemUp",
    Btn0: "moveItemUp",
    Axis0: "moveLeftRight",
  }
  const store = world({ menu: table, play: {} })

  store.update()

  expect(mapping(store, "keyboard")).toStrictEqual(table)
  expect(mapping(store, "gamepad")).toStrictEqual(table)
})

test("it should not displace the behaviour it is composed with", () => {
  // Behaviours compose by replacing, so a state machine would lose its own `create` -- and
  // with it the scene it was supposed to put up. Found by a game whose screens stopped
  // appearing, which is why this is worth a test of its own.
  const built = []
  const store = createStore({
    types: {
      Game: [
        mappings({ menu: { Enter: "choose" } }),
        {
          create(entity, payload, api) {
            built.push(entity.state)
          },
          stateChange(entity, { to }, api) {
            built.push(to)
          },
        },
      ],
    },
    entities: { game: { type: "Game", state: "menu" } },
  })

  store.update()
  store.getState().game.state = "play"
  store.notify("stateChange", { entityId: "game", from: "menu", to: "play" })
  store.update()

  expect(built).toStrictEqual(["menu", "play"])
})
