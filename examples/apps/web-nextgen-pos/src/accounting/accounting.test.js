import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import { entities } from "../store/entities.js"
import { types } from "../store/types.js"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

async function sell(store, saleId) {
  store.notify("#register:saleStart")
  store.notify(`#${saleId}:itemEnter`, "101")
  store.notify(`#${saleId}:end`)
  await vi.runAllTimersAsync()
  store.notify(`#${saleId}:pay`, 2000)
  await vi.runAllTimersAsync()
}

it("posts completed sales to the remote system", async () => {
  const store = createStore({ types, entities: structuredClone(entities) })

  await sell(store, "sale1")

  expect(store.getEntity("accounting")).toMatchObject({
    posted: ["sale1"],
    queued: [],
    sending: [],
  })
})

it("stores sales locally while offline and forwards them on reconnect", async () => {
  const store = createStore({ types, entities: structuredClone(entities) })

  store.notify("#network:change", false)
  await sell(store, "sale1")
  await sell(store, "sale2")

  const offline = store.getEntity("accounting")
  expect(offline.posted).toEqual([])
  expect(offline.queued.map(({ saleId }) => saleId)).toEqual(["sale1", "sale2"])

  store.notify("#network:change", true)
  await vi.runAllTimersAsync()

  expect(store.getEntity("accounting")).toMatchObject({
    posted: ["sale1", "sale2"],
    queued: [],
    sending: [],
  })
})
