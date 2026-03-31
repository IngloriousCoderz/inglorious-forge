import { performance } from "node:perf_hooks"

import { expect, test, vi } from "vitest"

import { EventMap } from "./event-map.js"

test("constructor should initialize the event map from types and entities", () => {
  const types = {
    Player: {
      update: () => {},
      fire: () => {},
    },
    Enemy: {
      update: () => {},
    },
    Item: {}, // Type with no events
  }
  const entities = {
    player1: { type: "Player" },
    player2: { type: "Player" },
    enemy1: { type: "Enemy" },
    item1: { type: "Item" },
    ghost1: { type: "Ghost" }, // Type that doesn't exist
  }

  const eventMap = new EventMap(types, entities)

  expect(eventMap.getEntitiesForEvent("update")).toStrictEqual([
    "player1",
    "player2",
    "enemy1",
  ])
  expect(eventMap.getEntitiesForEvent("fire")).toStrictEqual([
    "player1",
    "player2",
  ])

  // 'item' type has no events, so it shouldn't be in the map
  expect(eventMap.getEntitiesForEvent("item")).toStrictEqual([])
  // 'ghost' type doesn't exist, so it should be ignored
  expect(eventMap.getEntitiesForEvent("ghost")).toStrictEqual([])
})

test("addEntity should add an entity to the correct event sets", () => {
  const types = {
    Player: {
      update: () => {},
      jump: () => {},
    },
  }
  const eventMap = new EventMap(types, {})

  eventMap.addEntity("player1", types.Player, "Player")

  expect(eventMap.getEntitiesForEvent("update")).toStrictEqual(["player1"])
  expect(eventMap.getEntitiesForEvent("jump")).toStrictEqual(["player1"])

  // Add another entity of the same type
  eventMap.addEntity("player2", types.Player, "Player")
  expect(eventMap.getEntitiesForEvent("update")).toStrictEqual([
    "player1",
    "player2",
  ])
  expect(eventMap.getEntitiesForEvent("jump")).toStrictEqual([
    "player1",
    "player2",
  ])
})

test("removeEntity should remove an entity from its event sets", () => {
  const types = {
    Player: {
      update: () => {},
      fire: () => {},
    },
  }
  const entities = {
    player1: { type: "Player" },
    player2: { type: "Player" },
  }
  const eventMap = new EventMap(types, entities)

  eventMap.removeEntity("player1", types.Player, "Player")

  expect(eventMap.getEntitiesForEvent("update")).toStrictEqual(["player2"])
  expect(eventMap.getEntitiesForEvent("fire")).toStrictEqual(["player2"])

  // Removing a non-existent entity should not throw an error
  expect(() =>
    eventMap.removeEntity("player3", types.Player, "Player"),
  ).not.toThrow()
})

test("getEntitiesForEvent should return the correct set of entities for an event", () => {
  const types = {
    Player: { update: () => {} },
    Enemy: { update: () => {} },
  }
  const entities = {
    player1: { type: "Player" },
    enemy1: { type: "Enemy" },
  }
  const eventMap = new EventMap(types, entities)

  const updateEntities = eventMap.getEntitiesForEvent("update")
  expect(updateEntities).toStrictEqual(["player1", "enemy1"])

  const fireEntities = eventMap.getEntitiesForEvent("fire")
  expect(fireEntities).toStrictEqual([])
})

test("getEntitiesForEvent should handle scoped events correctly", () => {
  const types = {
    Form: { submit: () => {} },
    Button: { submit: () => {} },
  }
  const entities = {
    loginForm: { type: "Form" },
    signupForm: { type: "Form" },
    submitButton: { type: "Button" },
  }
  const eventMap = new EventMap(types, entities)

  // Scoped to a type: 'Form:submit' should only return form entities
  expect(eventMap.getEntitiesForEvent("Form:submit")).toStrictEqual([
    "loginForm",
    "signupForm",
  ])

  // Scoped to a specific entity by ID: '#loginForm:submit'
  expect(eventMap.getEntitiesForEvent("#loginForm:submit")).toStrictEqual([
    "loginForm",
  ])

  // Scoped to a specific entity by type and ID: 'Form#loginForm:submit'
  expect(eventMap.getEntitiesForEvent("Form#loginForm:submit")).toStrictEqual([
    "loginForm",
  ])

  // Scoped to a non-existent entity ID
  expect(eventMap.getEntitiesForEvent("#nonExistent:submit")).toStrictEqual([])

  // Scoped to an entity that exists but doesn't handle the event
  expect(eventMap.getEntitiesForEvent("#loginForm:click")).toStrictEqual([])

  // Scoped to an entity ID, but with the wrong type specified
  expect(eventMap.getEntitiesForEvent("Button#loginForm:submit")).toStrictEqual(
    [],
  )

  // Broadcast event should return all entities with the handler
  expect(eventMap.getEntitiesForEvent("submit")).toStrictEqual([
    "loginForm",
    "signupForm",
    "submitButton",
  ])
})

test("EventMap provides a significant performance benefit for event handling", async () => {
  const ENTITY_COUNT = 10000
  const { entities, types } = createTestEntities(ENTITY_COUNT)
  const eventMap = new EventMap(types, entities)

  // We'll use a mock function to ensure the "work" is consistent
  const updateHandler = vi.fn()
  types.Updater.update = updateHandler

  // --- Simulation A: The Old Way (iterating all entities) ---
  const oldWayStartTime = performance.now()
  for (const id in entities) {
    const entity = entities[id]
    const type = types[entity.type]
    if (type.update) {
      type.update()
    }
  }
  const oldWayTime = performance.now() - oldWayStartTime

  // Reset the mock for the next simulation
  updateHandler.mockClear()

  // --- Simulation B: The New Way (using EventMap) ---
  const newWayStartTime = performance.now()
  const updaterIds = eventMap.getEntitiesForEvent("update")
  for (const id of updaterIds) {
    const entity = entities[id]
    const type = types[entity.type]
    type.update()
  }
  const newWayTime = performance.now() - newWayStartTime

  // Assertions to verify correctness
  expect(oldWayTime).toBeGreaterThan(newWayTime)
  expect(updateHandler).toHaveBeenCalledTimes(updaterIds.length)
})

// Helper function to create a large set of test entities
function createTestEntities(count) {
  const entities = {}
  const types = {}
  // 10% of entities will have a mock 'update' handler
  const updaterType = { update: vi.fn() }
  const staticType = {}

  for (let i = 0; i < count; i++) {
    const isUpdater = Math.random() < 0.1
    const typeId = isUpdater ? "Updater" : "Static"
    entities[`entity-${i}`] = { id: `entity-${i}`, type: typeId }
  }
  types.Updater = updaterType
  types.Static = staticType

  return { entities, types }
}
