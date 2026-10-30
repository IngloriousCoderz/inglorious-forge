import { fsm } from "@inglorious/store/behaviors/state-machine/fsm.js"
import { createStore } from "@inglorious/store/store.js"
import { beforeEach, expect, test, vi } from "vitest"

import { gamepad } from "./gamepad.js"
import { keyboard } from "./keyboard.js"
import { mappings } from "./mappings.js"

beforeEach(() => {
  vi.stubGlobal("document", { body: {}, addEventListener: () => {} })

  return () => vi.unstubAllGlobals()
})

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
  const built = []
  const store = createStore({
    types: {
      Game: [
        mappings({ menu: { Enter: "choose" } }),
        {
          create(entity) {
            built.push(entity.state)
          },
          stateChange(entity, { to }) {
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
