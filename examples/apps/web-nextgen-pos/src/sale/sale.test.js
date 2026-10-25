import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { entities } from "../store/entities.js"
import { types } from "../store/types.js"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function setup() {
  const store = createStore({ types, entities: structuredClone(entities) })
  store.notify("#register:saleStart")

  return store
}

describe("Sale", () => {
  it("is created by the register", () => {
    const store = setup()

    expect(store.getEntity("register").saleId).toBe("sale1")
    expect(store.getEntity("sale1")).toMatchObject({
      type: "Sale",
      state: "open",
      lines: [],
    })
  })

  it("adds up repeated scans of the same item", () => {
    const store = setup()

    store.notify("#sale1:itemEnter", "101")
    store.notify("#sale1:itemEnter", "101")

    expect(store.getEntity("sale1").lines).toEqual([
      { itemId: "101", quantity: 2 },
    ])
  })

  it("goes from open to paying once the tax is in", async () => {
    const store = setup()

    store.notify("#sale1:itemEnter", "200")
    store.notify("#sale1:end")
    expect(store.getEntity("sale1").state).toBe("totaling")

    await vi.runAllTimersAsync()

    expect(store.getEntity("sale1")).toMatchObject({
      state: "paying",
      tax: 390,
    })
  })

  it("ignores items entered after the sale has ended", async () => {
    const store = setup()

    store.notify("#sale1:itemEnter", "200")
    store.notify("#sale1:end")
    await vi.runAllTimersAsync()
    store.notify("#sale1:itemEnter", "100")

    expect(store.getEntity("sale1").lines).toEqual([
      { itemId: "200", quantity: 1 },
    ])
  })

  it("refuses a payment that does not cover the total", async () => {
    const store = setup()

    store.notify("#sale1:itemEnter", "200")
    store.notify("#sale1:end")
    await vi.runAllTimersAsync()
    store.notify("#sale1:pay", 100)

    expect(store.getEntity("sale1").state).toBe("paying")
    expect(store.getEntity("sale1").error).toBeTruthy()
  })

  it("completes with a receipt that no longer follows the pricing policy", async () => {
    const store = setup()

    store.notify("#sale1:itemEnter", "200")
    store.notify("#sale1:end")
    await vi.runAllTimersAsync()
    store.notify("#sale1:pay", 5000)
    store.notify("#pricing:policyChange", "regular")

    // $39.00 - 10% + $3.90 tax
    expect(store.getEntity("sale1")).toMatchObject({
      state: "complete",
      receipt: { total: 3900, payment: 5000, change: 1100 },
    })
  })
})
