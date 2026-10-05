import { expect, test } from "vitest"

import { createStore } from "./store.js"

test("it should process events by mutating state inside handlers", () => {
  const config = {
    types: {
      Kitty: {
        feed(entity) {
          entity.isFed = true
        },
      },
    },
    entities: {
      kitty1: { type: "Kitty" },
    },
  }
  const afterState = {
    kitty1: {
      id: "kitty1",
      type: "Kitty",
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
      Kitty: {
        feed(entity) {
          entity.isFed = true
        },
        update(entity) {
          entity.isMeowing = true
        },
      },
    },

    entities: {
      kitty1: { type: "Kitty" },
    },
  }
  const afterState = {
    kitty1: {
      id: "kitty1",
      type: "Kitty",
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
      Doggo: {
        update(entity, dt, api) {
          api.notify("bark")
        },
      },
      Kitty: {
        bark(entity) {
          entity.position = "far"
        },
      },
    },

    entities: {
      doggo1: { type: "Doggo" },
      kitty1: { type: "Kitty", position: "near" },
    },

    updateMode: "manual",
  }
  const afterState = {
    doggo1: { id: "doggo1", type: "Doggo" },
    kitty1: { id: "kitty1", type: "Kitty", position: "far" },
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
      Kitty: {},
    },
    entities: {},
  }
  const newEntity = { id: "kitty1", type: "Kitty" }
  const afterState = {
    kitty1: { id: "kitty1", type: "Kitty" },
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
      kitty1: { type: "Kitty" },
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
      Bug: Caterpillar,
    },

    entities: {
      bug: { type: "Bug" },
    },
  }

  const store = createStore(config)

  store.notify("eat")
  store.update()

  expect(store.getState()).toStrictEqual({
    bug: { id: "bug", type: "Bug", isFull: true },
  })

  store.setType("Bug", [Caterpillar, Butterfly])
  store.notify("fly")
  store.update()
  expect(store.getState()).toStrictEqual({
    bug: { id: "bug", type: "Bug", isFull: true, hasFlown: true },
  })
})

test("it should auto-create entities when autoCreateEntities is enabled", () => {
  const config = {
    types: {
      Game: {},
      Player: {},
    },
    entities: {
      player1: { type: "Player" },
    },
    autoCreateEntities: true,
  }

  const store = createStore(config)
  const state = store.getState()

  expect(state.game).toStrictEqual({
    id: "game",
    type: "Game",
  })

  expect(state.player).toBeUndefined()
  expect(state.player1).toStrictEqual({
    id: "player1",
    type: "Player",
  })
})

const HALTED = {
  types: {
    Game: [
      {
        update(entity) {
          entity.frames = (entity.frames ?? 0) + 1
        },
      },
    ],
    Overlay: [
      {
        update(entity) {
          entity.frames++
        },
      },
    ],
  },
  entities: {
    game: { type: "Game", frames: 0 },
    overlay: { type: "Overlay", frames: 0, updatesWhilePaused: true },
  },
}

test("it should halt updates for every type", () => {
  const store = createStore(HALTED)

  store.notify("update")
  store.notify("pause")
  store.update()
  store.notify("update")
  store.update()

  expect(store.getState().game.frames).toBe(1)
})

test("it should keep updating an entity that says it updates while paused", () => {
  const store = createStore(HALTED)

  store.notify("pause")
  store.update()
  store.notify("update")
  store.update()

  expect(store.getState().game.frames).toBe(0)
  expect(store.getState().overlay.frames).toBe(1)
})

test("it should resume updates", () => {
  const store = createStore(HALTED)

  store.notify("pause")
  store.notify("resume")
  store.update()
  store.notify("update")
  store.update()

  expect(store.getState().game.frames).toBe(1)
  expect(store.getState().overlay.frames).toBe(1)
})

test("it should keep handling other events while halted", () => {
  const config = {
    types: {
      Game: [
        { update() {} },
        {
          press(entity) {
            entity.presses = (entity.presses ?? 0) + 1
          },
        },
      ],
    },
    entities: { game: { type: "Game" } },
  }
  const store = createStore(config)

  store.notify("pause")
  store.update()

  // This is the whole point of halting the update rather than every event: whatever
  // takes the pause back off has to keep receiving its events.
  store.notify("press")
  store.update()

  expect(store.getState().game.presses).toBe(1)
})
