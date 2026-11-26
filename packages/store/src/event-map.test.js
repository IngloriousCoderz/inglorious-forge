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
    Item: {},
  }
  const entities = {
    player1: { type: "Player" },
    player2: { type: "Player" },
    enemy1: { type: "Enemy" },
    item1: { type: "Item" },
    ghost1: { type: "Ghost" },
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

  expect(eventMap.getEntitiesForEvent("item")).toStrictEqual([])
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

  expect(eventMap.getEntitiesForEvent("Form:submit")).toStrictEqual([
    "loginForm",
    "signupForm",
  ])

  expect(eventMap.getEntitiesForEvent("#loginForm:submit")).toStrictEqual([
    "loginForm",
  ])

  expect(eventMap.getEntitiesForEvent("Form#loginForm:submit")).toStrictEqual([
    "loginForm",
  ])

  expect(eventMap.getEntitiesForEvent("#nonExistent:submit")).toStrictEqual([])

  expect(eventMap.getEntitiesForEvent("#loginForm:click")).toStrictEqual([])

  expect(eventMap.getEntitiesForEvent("Button#loginForm:submit")).toStrictEqual(
    [],
  )

  expect(eventMap.getEntitiesForEvent("submit")).toStrictEqual([
    "loginForm",
    "signupForm",
    "submitButton",
  ])
})

// Counts entity visits rather than timing loops: a wall-clock comparison of
// two runs flips under load (GC pauses, parallel test workers).
test("EventMap visits only the entities that handle an event", () => {
  const ENTITY_COUNT = 100000
  const UPDATER_EVERY = 10
  const { entities, types } = createTestEntities(ENTITY_COUNT, UPDATER_EVERY)
  const eventMap = new EventMap(types, entities)

  let visits = 0
  const visit = (id) => {
    visits++
    return entities[id]
  }

  for (const id in entities) {
    const entity = visit(id)
    types[entity.type].update?.()
  }
  const scanVisits = visits

  visits = 0
  const updaterIds = eventMap.getEntitiesForEvent("update")
  for (const id of updaterIds) {
    const entity = visit(id)
    types[entity.type].update()
  }
  const mappedVisits = visits

  expect(scanVisits).toBe(ENTITY_COUNT)
  expect(mappedVisits).toBe(ENTITY_COUNT / UPDATER_EVERY)
  expect(types.Updater.update).toHaveBeenCalledTimes(mappedVisits * 2)
})

function createTestEntities(count, updaterEvery) {
  const entities = {}
  const types = { Updater: { update: vi.fn() }, Static: {} }

  for (let i = 0; i < count; i++) {
    const type = i % updaterEvery === 0 ? "Updater" : "Static"
    entities[`entity-${i}`] = { id: `entity-${i}`, type }
  }

  return { entities, types }
}
