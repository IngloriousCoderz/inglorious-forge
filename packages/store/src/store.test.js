import { afterEach, expect, test, vi } from "vitest"

import { createStore } from "./store.js"

afterEach(() => {
  vi.useRealTimers()
})

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

test("it should collapse rapid debounced notifications into a single handler run", () => {
  vi.useFakeTimers()

  const config = {
    types: {
      Kitty: {
        feed(entity) {
          entity.mealCount = (entity.mealCount ?? 0) + 1
        },
      },
    },
    entities: {
      kitty1: { type: "Kitty" },
    },
  }

  const store = createStore(config)

  store.notifyDebounced("feed", undefined, 100)
  store.notifyDebounced("feed", undefined, 100)
  store.notifyDebounced("feed", undefined, 100)

  // nothing fires until the wait elapses
  expect(store.getState().kitty1.mealCount).toBeUndefined()

  vi.advanceTimersByTime(100)

  // three rapid calls resulted in exactly one handler run
  expect(store.getState().kitty1.mealCount).toBe(1)
})

test("it should notify with the most recent payload when debounced", () => {
  vi.useFakeTimers()

  const config = {
    types: {
      Kitty: {
        setName(entity, name) {
          entity.name = name
        },
      },
    },
    entities: {
      kitty1: { type: "Kitty" },
    },
  }

  const store = createStore(config)

  store.notifyDebounced("setName", "Whiskers", 100)
  store.notifyDebounced("setName", "Mittens", 100)

  vi.advanceTimersByTime(100)

  expect(store.getState().kitty1.name).toBe("Mittens")
})

test("it should debounce each event type independently", () => {
  vi.useFakeTimers()

  const config = {
    types: {
      Kitty: {
        feed(entity) {
          entity.isFed = true
        },
        pet(entity) {
          entity.isHappy = true
        },
      },
    },
    entities: {
      kitty1: { type: "Kitty" },
    },
  }

  const store = createStore(config)

  store.notifyDebounced("feed", undefined, 100)
  store.notifyDebounced("pet", undefined, 100)

  vi.advanceTimersByTime(100)

  expect(store.getState().kitty1.isFed).toBe(true)
  expect(store.getState().kitty1.isHappy).toBe(true)
})
