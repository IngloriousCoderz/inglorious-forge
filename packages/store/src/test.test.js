import { describe, expect, it } from "vitest"

import { createMockApi, trigger } from "./test"

describe("createMockApi", () => {
  it("should create a mock API with all required methods", () => {
    const entities = { counter1: { type: "counter", value: 0 } }

    const api = createMockApi(entities)

    expect(api.getEntities).toBeDefined()
    expect(api.getEntity).toBeDefined()
    expect(api.select).toBeDefined()
    expect(api.dispatch).toBeDefined()
    expect(api.notify).toBeDefined()
    expect(api.getEvents).toBeDefined()
  })

  it("should return all entities via getEntities()", () => {
    const entities = {
      counter1: { type: "counter", value: 5 },
      counter2: { type: "counter", value: 10 },
    }

    const api = createMockApi(entities)

    expect(api.getEntities()).toEqual(entities)
  })

  it("should return a specific entity via getEntity()", () => {
    const entities = {
      counter1: { type: "counter", value: 5 },
      counter2: { type: "counter", value: 10 },
    }

    const api = createMockApi(entities)

    expect(api.getEntity("counter1")).toEqual({ type: "counter", value: 5 })
    expect(api.getEntity("counter2")).toEqual({ type: "counter", value: 10 })
  })

  it("should return undefined for non-existent entity", () => {
    const entities = {
      counter1: { type: "counter", value: 5 },
    }

    const api = createMockApi(entities)

    expect(api.getEntity("nonexistent")).toBeUndefined()
  })

  it("should track dispatched events", () => {
    const entities = {
      counter1: { type: "counter", value: 0 },
    }

    const api = createMockApi(entities)

    api.dispatch({ type: "increment", payload: { id: "counter1" } })
    api.dispatch({ type: "decrement", payload: { id: "counter1" } })

    expect(api.getEvents()).toEqual([
      { type: "increment", payload: { id: "counter1" } },
      { type: "decrement", payload: { id: "counter1" } },
    ])
  })

  it("should track events dispatched via notify()", () => {
    const entities = {
      counter1: { type: "counter", value: 0 },
    }

    const api = createMockApi(entities)

    api.notify("increment", { id: "counter1", amount: 5 })
    api.notify("overflow")

    expect(api.getEvents()).toEqual([
      { type: "increment", payload: { id: "counter1", amount: 5 } },
      { type: "overflow", payload: undefined },
    ])
  })

  it("should freeze entities to prevent mutations", () => {
    const entities = {
      counter1: { type: "counter", value: 0 },
    }

    const api = createMockApi(entities)
    const allEntities = api.getEntities()

    expect(() => {
      allEntities.counter1 = { type: "counter", value: 999 }
    }).toThrow()
  })

  it("should start with empty events array", () => {
    const entities = {
      counter1: { type: "counter", value: 0 },
    }

    const api = createMockApi(entities)

    expect(api.getEvents()).toEqual([])
  })
})

describe("trigger", () => {
  it("should execute handler and return new entity", () => {
    const entityBefore = { type: "counter", value: 0 }
    const entityAfter = { type: "counter", value: 5 }

    function increment(entity, amount) {
      entity.value += amount
    }

    const { entity } = trigger(entityBefore, increment, 5)

    expect(entity).toStrictEqual(entityAfter)
  })

  it("should not mutate original entity", () => {
    const entityBefore = { type: "counter", value: 0 }

    function increment(entity, amount) {
      entity.value += amount
    }

    trigger(entityBefore, increment, 5)

    expect(entityBefore.value).toBe(0)
  })

  it("should capture events dispatched during handler execution", () => {
    const entityBefore = { type: "counter", value: 99 }
    const entityAfter = { type: "counter", value: 104 }
    const eventsAfter = [{ type: "overflow", payload: 104 }]

    function increment(entity, amount, api) {
      entity.value += amount

      if (entity.value > 100) {
        api.notify("overflow", entity.value)
      }
    }

    const { entity, events } = trigger(entityBefore, increment, 5)

    expect(entity).toStrictEqual(entityAfter)
    expect(events).toStrictEqual(eventsAfter)
  })

  it("should work with handlers that do not dispatch events", () => {
    const entityBefore = { type: "todo", text: "Buy milk", completed: false }
    const entityAfter = { type: "todo", text: "Buy milk", completed: true }
    const eventsAfter = []

    function toggle(entity) {
      entity.completed = !entity.completed
    }

    const { entity, events } = trigger(entityBefore, toggle)

    expect(entity).toStrictEqual(entityAfter)
    expect(events).toStrictEqual(eventsAfter)
  })

  it("should allow handler to read other entities via API", () => {
    const entityBefore = { id: "counter2", type: "counter", value: 20 }
    const entityAfter = { id: "counter2", type: "counter", value: 30 }

    const mockApi = createMockApi({
      counter1: { id: "counter1", type: "counter", value: 10 },
      counter2: { id: "counter2", type: "counter", value: 20 },
    })

    function addFromSource(entity, sourceId, api) {
      const source = api.getEntity(sourceId)
      if (source) {
        entity.value += source.value
      }
    }

    const { entity } = trigger(entityBefore, addFromSource, "counter1", mockApi)

    expect(entity).toStrictEqual(entityAfter)
  })

  it("should accept custom mock API", () => {
    const entityBefore = { type: "counter", value: 0 }
    const entityAfter = { type: "counter", value: 5 }
    const eventsAfter = [{ type: "incremented", payload: undefined }]

    const customApi = createMockApi(entityBefore)

    function increment(entity, amount, api) {
      entity.value += amount
      api.notify("incremented")
    }

    const { entity } = trigger(entityBefore, increment, 5, customApi)

    expect(entity).toStrictEqual(entityAfter)
    expect(customApi.getEvents()).toStrictEqual(eventsAfter)
  })

  it("should handle multiple dispatched events", () => {
    const entityBefore = { type: "counter", value: 50 }
    const entityAfter = { type: "counter", value: 110 }
    const eventsAfter = [
      { type: "increment:start", payload: undefined },
      { type: "milestone:hundred", payload: undefined },
      { type: "increment:complete", payload: 110 },
    ]

    function increment(entity, amount, api) {
      api.notify("increment:start")

      entity.value += amount

      if (entity.value >= 100) {
        api.notify("milestone:hundred")
      }

      api.notify("increment:complete", entity.value)
    }

    const { entity, events } = trigger(entityBefore, increment, 60)

    expect(entity).toStrictEqual(entityAfter)
    expect(events).toStrictEqual(eventsAfter)
  })

  it("should work without payload", () => {
    const entityBefore = { type: "counter", value: 5 }
    const entityAfter = { type: "counter", value: 0 }

    function reset(entity) {
      entity.value = 0
    }

    const { entity } = trigger(entityBefore, reset)

    expect(entity).toStrictEqual(entityAfter)
  })

  it("should work with complex entity mutations", () => {
    const entityBefore = {
      type: "player",
      name: "Alice",
      inventory: ["sword", "shield"],
      stats: { health: 100, mana: 50 },
    }
    const entityAfter = {
      type: "player",
      name: "Alice",
      inventory: ["sword", "shield", "potion"],
      stats: { health: 100, mana: 50 },
    }

    function addItem(entity, item, api) {
      entity.inventory.push(item)
      api.notify("item:added", { item })
    }

    const { entity, events } = trigger(entityBefore, addItem, "potion")

    expect(entity).toStrictEqual(entityAfter)
    expect(events).toEqual([
      { type: "item:added", payload: { item: "potion" } },
    ])
  })
})
