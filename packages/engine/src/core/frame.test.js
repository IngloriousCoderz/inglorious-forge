import { createStore } from "@inglorious/store/store.js"
import { expect, test, vi } from "vitest"

/**
 * What the store does between an event being given to it and the world moving.
 *
 * The engine leans on this to say what one frame is: it gives the store an `update`
 * event and then asks the store to process the queue. If giving the event were itself
 * to process the queue, that frame would move the world twice.
 */

function createWatchedStore({ updateMode }) {
  const store = createStore({
    types: {
      Counter: {
        increment(entity, amount) {
          entity.count += amount
        },
      },
    },
    entities: { counter: { type: "Counter", count: 0 } },
    updateMode,
  })

  const updates = vi.spyOn(store, "update")

  store.update()
  updates.mockClear()

  return { store, updates }
}

test("a manual store queues what it is told without processing it", () => {
  const { store, updates } = createWatchedStore({ updateMode: "manual" })

  store.notify("increment", 5)

  expect(store.getState().counter.count).toBe(0)
  expect(updates).not.toHaveBeenCalled()
})

test("a manual store processes the queue exactly once when asked", () => {
  const { store, updates } = createWatchedStore({ updateMode: "manual" })

  store.notify("increment", 5)
  store.update()

  expect(store.getState().counter.count).toBe(5)
  expect(updates).toHaveBeenCalledTimes(1)
})

test("an automatic store moves the world on the event itself", () => {
  const { store, updates } = createWatchedStore({ updateMode: "auto" })

  store.notify("increment", 5)

  expect(store.getState().counter.count).toBe(5)
  expect(updates).not.toHaveBeenCalled()
})
