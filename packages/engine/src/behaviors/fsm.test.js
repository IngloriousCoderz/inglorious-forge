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

/**
 * A machine is observed the way anything else would observe it: by an entity that
 * handles the announcement, rather than by reaching inside the store.
 */
const build = () => {
  const config = {
    types: {
      Kitty: [
        fsm({
          default: {
            meow(entity) {
              entity.state = "meowing"
            },
            purr() {},
          },
          meowing: {
            nap(entity) {
              entity.state = "napping"
            },
          },
        }),
      ],

      Watcher: [
        {
          stateChange(entity, transition) {
            entity.seen.push(transition)
          },
        },
      ],
    },
    entities: {
      entity1: { type: "Kitty" },
      watcher: { type: "Watcher", seen: [] },
    },
  }

  const store = createStore(config)
  const seen = () => store.getState().watcher.seen

  return { store, seen }
}

test("it should announce a state change", () => {
  const { store, seen } = build()

  store.notify("meow")
  store.update()

  expect(store.getState().entity1.state).toBe("meowing")
  expect(seen()).toStrictEqual([
    { entityId: "entity1", from: "default", to: "meowing" },
  ])
})

test("it should announce every state change in turn", () => {
  const { store, seen } = build()

  store.notify("meow")
  store.update()
  store.notify("nap")
  store.update()

  expect(seen().at(-1)).toStrictEqual({
    entityId: "entity1",
    from: "meowing",
    to: "napping",
  })
  expect(seen()).toHaveLength(2)
})

test("it should stay quiet when a handler does not move the machine", () => {
  const { store, seen } = build()

  store.notify("meow")
  store.update()
  store.notify("purr")
  store.update()

  expect(seen()).toHaveLength(1)
})

test("it should let a state answer for itself in place of the type", () => {
  // The type's handler is the default every state would otherwise do; a state that names
  // the same event takes it over rather than adding to it.
  const calls = []

  const config = {
    types: {
      Kitty: [
        {
          leave(entity) {
            calls.push(`type in ${entity.state}`)
          },
        },
        fsm({
          default: {},
          table: {
            // The screen that keeps the way out for itself.
            leave(entity) {
              calls.push("back to the menu")

              entity.state = "default"
            },
          },
          play: {},
        }),
      ],
    },
    entities: { entity1: { type: "Kitty", state: "default" } },
  }

  const store = createStore(config)

  store.notify("leave")
  store.update()
  expect(calls).toEqual(["type in default"])

  store.getState().entity1.state = "table"
  store.notify("leave")
  store.update()
  expect(calls).toEqual(["type in default", "back to the menu"])
  expect(store.getState().entity1.state).toBe("default")

  store.getState().entity1.state = "play"
  store.notify("leave")
  store.update()
  expect(calls).toEqual(["type in default", "back to the menu", "type in play"])
})
