import { createStore } from "@inglorious/store/store.js"
import { expect, test } from "vitest"

import { fsm } from "./fsm.js"

test("it should add a finite state machine", () => {
  const config = {
    types: {
      Kitty: [
        fsm({
          default: {
            meow(entity) {
              entity.state = "meowing"
            },
          },
          meowing: {
            update(entity) {
              entity.treats++
            },
          },
        }),
      ],
    },
    entities: {
      entity1: {
        type: "Kitty",
        treats: 0,
      },
    },
  }
  const afterState = {
    entity1: {
      id: "entity1",
      type: "Kitty",
      state: "meowing",
      treats: 1,
    },
  }

  const store = createStore(config)
  store.notify("meow")
  store.notify("update")
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})
