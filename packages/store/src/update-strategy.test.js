import { describe, expect, test } from "vitest"

import { createStore } from "./store.js"

function createCounterStore(updateStrategy) {
  return createStore({
    types: {
      Counter: {
        increment(entity, amount) {
          entity.count += amount
        },
      },
    },
    entities: { counter: { type: "Counter", count: 0 } },
    updateMode: "manual",
    updateStrategy,
  })
}

describe("updateStrategy", () => {
  const STRATEGIES = ["structural-sharing", "copy-on-dispatch"]

  test("defaults to structural sharing", () => {
    const store = createCounterStore(undefined)
    const before = store.getState()

    store.notify("increment", 5)
    store.update()

    expect(store.getState().counter.count).toBe(5)
    expect(before.counter.count).toBe(0)
    expect(store.getState()).not.toBe(before)
  })

  test("structural sharing keeps unchanged entities referentially equal", () => {
    const store = createCounterStore("structural-sharing")
    const before = store.getState()

    store.notify("increment", 1)
    store.update()

    const after = store.getState()
    expect(after.counter).not.toBe(before.counter)
  })

  test("copy on dispatch copies the state before applying events", () => {
    const store = createCounterStore("copy-on-dispatch")
    const before = store.getState()

    store.notify("increment", 5)
    store.update()

    const after = store.getState()
    expect(after.counter.count).toBe(5)
    expect(before.counter.count).toBe(0)
    expect(after).not.toBe(before)
    expect(after.counter).not.toBe(before.counter)
  })

  describe("copy on dispatch copies only what it hands out", () => {
    function createWorld(systems = []) {
      return createStore({
        types: {
          Mover: {
            move(entity) {
              entity.position[0] += 1
            },
          },
          Rock: {},
        },
        entities: {
          mover: { type: "Mover", position: [0, 0, 0] },
          rock: { type: "Rock", position: [5, 0, 0] },
        },
        systems,
        updateMode: "manual",
        updateStrategy: "copy-on-dispatch",
      })
    }

    test("an entity no handler is given keeps its reference", () => {
      const store = createWorld()
      store.update()
      const before = store.getState()

      store.notify("move")
      store.update()

      const after = store.getState()
      expect(after.mover).not.toBe(before.mover)
      expect(after.mover.position).toEqual([1, 0, 0])
      expect(before.mover.position).toEqual([0, 0, 0])
      expect(after.rock).toBe(before.rock)
    })

    test("a system writing through the draft leaves the previous state alone", () => {
      const store = createWorld([
        {
          move(entities) {
            entities.rock.position[0] = 9
          },
        },
      ])
      store.update()
      const before = store.getState()

      store.notify("move")
      store.update()

      expect(store.getState().rock.position).toEqual([9, 0, 0])
      expect(before.rock.position).toEqual([5, 0, 0])
    })

    test("a patch shares nothing with the previous state", () => {
      const store = createWorld()
      store.update()
      const before = store.getState()

      store.notify("patch", { id: "mover", speed: 2 })
      store.notify("move")
      store.update()

      expect(store.getState().mover).toMatchObject({
        speed: 2,
        position: [1, 0, 0],
      })
      expect(before.mover.position).toEqual([0, 0, 0])
    })
  })

  test("an update with nothing queued leaves the state alone", () => {
    for (const updateStrategy of STRATEGIES) {
      const store = createCounterStore(updateStrategy)

      store.update()

      const before = store.getState()
      const seen = []

      store.subscribe(() => seen.push(store.getState().counter.count))
      const processed = store.update()

      expect(processed).toEqual([])
      expect(store.getState()).toBe(before)
      expect(seen).toEqual([])
    }
  })

  test("both strategies add and remove entities", () => {
    for (const updateStrategy of STRATEGIES) {
      const store = createStore({
        types: { Counter: {} },
        entities: { counter: { type: "Counter", count: 1 } },
        updateMode: "manual",
        updateStrategy,
      })

      store.notify("add", { id: "second", type: "Counter", count: 2 })
      store.update()
      expect(store.getState().second.count).toBe(2)

      store.notify("remove", "second")
      store.update()
      expect(store.getState().second).toBeUndefined()
    }
  })

  test("copy on dispatch does not freeze the state even in devMode", () => {
    const store = createStore({
      types: {
        Counter: {
          increment(entity) {
            entity.count += 1
          },
        },
      },
      entities: {
        game: { type: "Game", devMode: true },
        counter: { type: "Counter", count: 0 },
      },
      updateMode: "manual",
      updateStrategy: "copy-on-dispatch",
    })

    store.notify("increment")
    store.update()

    expect(Object.isFrozen(store.getState())).toBe(false)
    expect(Object.isFrozen(store.getState().counter)).toBe(false)
  })

  test("structural sharing freezes the state in devMode", () => {
    const store = createStore({
      types: {
        Counter: {
          increment(entity) {
            entity.count += 1
          },
        },
      },
      entities: {
        game: { type: "Game", devMode: true },
        counter: { type: "Counter", count: 0 },
      },
      updateMode: "manual",
    })

    store.notify("increment")
    store.update()

    expect(Object.isFrozen(store.getState().counter)).toBe(true)
  })

  test("rejects an unsupported update strategy", () => {
    expect(() => createCounterStore("immutable")).toThrow(TypeError)
    expect(() => createCounterStore("immutable")).toThrow(
      /Unsupported update strategy: immutable/,
    )
  })

  describe("state swapping", () => {
    function createObserverStore(updateStrategy) {
      return createStore({
        types: {
          Counter: {
            increment(entity, amount) {
              entity.count += amount
            },
            observe(entity, payload, api) {
              entity.observed = api.getEntity("other").count
            },
          },
        },
        entities: {
          counter: { type: "Counter", count: 0 },
          other: { type: "Counter", count: 0 },
        },
        updateMode: "manual",
        updateStrategy,
      })
    }

    test("the current state is swapped only after every event is processed", () => {
      for (const updateStrategy of STRATEGIES) {
        const store = createObserverStore(updateStrategy)

        store.notify("increment", 5)
        store.update()

        expect(store.getState().counter.count).toBe(5)
      }
    })

    test("api reads see the previous state during an update", () => {
      for (const updateStrategy of STRATEGIES) {
        const store = createObserverStore(updateStrategy)

        store.notify("increment", 5)
        store.notify("observe")
        store.update()

        expect(store.getState().counter.observed).toBe(0)
      }
    })

    test("subscribers observe the swapped state", () => {
      for (const updateStrategy of STRATEGIES) {
        const store = createObserverStore(updateStrategy)
        const seen = []

        store.subscribe(() => seen.push(store.getState().counter.count))
        store.notify("increment", 5)
        store.update()

        expect(seen).toEqual([5])
      }
    })
  })
})
