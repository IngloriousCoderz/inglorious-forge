import { expect, test } from "vitest"

import { augmentEntities, augmentEntity } from "./entities.js"

test("augmentEntity should add an id to an entity", () => {
  const entity = { type: "Player", health: 100 }
  const result = augmentEntity("player1", entity)

  expect(result).toStrictEqual({ id: "player1", type: "Player", health: 100 })
})

test("augmentEntity should not mutate the original entity", () => {
  const entity = { type: "Player" }
  augmentEntity("player1", entity)

  expect(entity).toStrictEqual({ type: "Player" })
  expect(entity).not.toHaveProperty("id")
})

test("augmentEntity should overwrite an existing id property", () => {
  const entity = { id: "oldId", type: "Player" }
  const result = augmentEntity("newId", entity)

  expect(result).toStrictEqual({ id: "newId", type: "Player" })
})

test("augmentEntities should augment a collection of entities", () => {
  const entities = {
    player1: { type: "Player", health: 100 },
    enemy1: { type: "Enemy", damage: 10 },
  }
  const result = augmentEntities(entities)

  expect(result).toStrictEqual({
    player1: { id: "player1", type: "Player", health: 100 },
    enemy1: { id: "enemy1", type: "Enemy", damage: 10 },
  })
})

test("augmentEntities should handle an empty collection", () => {
  const result = augmentEntities({})

  expect(result).toStrictEqual({})
})

test("augmentEntities should not mutate the original entities object", () => {
  const entities = { player1: { type: "Player" } }
  augmentEntities(entities)

  expect(entities.player1).not.toHaveProperty("id")
})
