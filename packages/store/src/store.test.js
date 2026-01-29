import { expect, test } from "vitest"

import { createStore } from "./store.js"

test("it should process events by mutating state inside handlers", () => {
  const config = {
    types: {
      kitty: {
        feed(entity) {
          entity.isFed = true
        },
      },
    },
    entities: {
      kitty1: { type: "kitty" },
    },
  }
  const afterState = {
    kitty1: {
      id: "kitty1",
      type: "kitty",
      isFed: true,
    },
  }

  const store = createStore(config)
  store.notify("feed")
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should process an event queue in the same update cycle", () => {
  const config = {
    types: {
      kitty: {
        feed(entity) {
          entity.isFed = true
        },
        update(entity) {
          entity.isMeowing = true
        },
      },
    },

    entities: {
      kitty1: { type: "kitty" },
    },
  }
  const afterState = {
    kitty1: {
      id: "kitty1",
      type: "kitty",
      isFed: true,
      isMeowing: true,
    },
  }

  const store = createStore(config)
  store.notify("feed")
  store.notify("update")
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should send an event from an entity and process it in the same update cycle in batched mode", () => {
  const config = {
    types: {
      doggo: {
        update(entity, dt, api) {
          api.notify("bark")
        },
      },
      kitty: {
        bark(entity) {
          entity.position = "far"
        },
      },
    },

    entities: {
      doggo1: { type: "doggo" },
      kitty1: { type: "kitty", position: "near" },
    },

    updateMode: "manual",
  }
  const afterState = {
    doggo1: { id: "doggo1", type: "doggo" },
    kitty1: { id: "kitty1", type: "kitty", position: "far" },
  }

  const store = createStore(config)
  const api = { notify: store.notify }
  store.notify("update")
  store.update(api)

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should add an entity via an 'add' event", () => {
  const config = {
    types: {
      kitty: {},
    },
    entities: {},
  }
  const newEntity = { id: "kitty1", type: "kitty" }
  const afterState = {
    kitty1: { id: "kitty1", type: "kitty" },
  }

  const store = createStore(config)
  store.notify("add", newEntity)
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should remove an entity via a 'remove' event", () => {
  const config = {
    types: {},
    entities: {
      kitty1: { type: "kitty" },
    },
  }
  const store = createStore(config)

  store.notify("remove", "kitty1")
  store.update()

  const state = store.getState()
  expect(state.kitty1).toBeUndefined()
})

test("it should change an entity's behavior via setType", () => {
  const Caterpillar = {
    eat(entity) {
      entity.isFull = true
    },
  }
  const Butterfly = {
    fly(entity) {
      entity.hasFlown = true
    },
  }

  const config = {
    types: {
      bug: Caterpillar,
    },

    entities: {
      bug: { type: "bug" },
    },
  }

  const store = createStore(config)

  store.notify("eat")
  store.update()

  expect(store.getState()).toStrictEqual({
    bug: { id: "bug", type: "bug", isFull: true },
  })

  store.setType("bug", [Caterpillar, Butterfly])
  store.notify("fly")
  store.update()
  expect(store.getState()).toStrictEqual({
    bug: { id: "bug", type: "bug", isFull: true, hasFlown: true },
  })
})

test("it should auto-create entities when autoCreateEntities is enabled", () => {
  const config = {
    types: {
      game: {},
      player: {},
    },
    entities: {
      player1: { type: "player" },
    },
    autoCreateEntities: true,
  }

  const store = createStore(config)
  const state = store.getState()

  expect(state.game).toStrictEqual({
    id: "game",
    type: "game",
  })

  expect(state.player).toBeUndefined()
  expect(state.player1).toStrictEqual({
    id: "player1",
    type: "player",
  })
})
