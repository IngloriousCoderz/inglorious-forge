import { createStore } from "@inglorious/store/store.js"
import { v } from "@inglorious/utils/v.js"
import { expect, test } from "vitest"

import { entityPoolMiddleware } from "./entity-pool-middleware.js"

const createGame = (entities = {}) =>
  createStore({
    types: { Pipe: {}, Bird: {} },
    entities: {
      game: { type: "Game", devMode: false },
      bird: {
        type: "Bird",
        position: v(100, 0, 100),
        size: v(10, 0, 10),
        collisions: { hitbox: { shape: "rectangle" } },
      },
      ...entities,
    },
    middlewares: [entityPoolMiddleware()],
    updateMode: "manual",
  })

const spawn = (store, position, size) => {
  store.notify("spawn", {
    type: "Pipe",
    position,
    size,
    collisions: { hitbox: { shape: "rectangle" } },
  })
  return store.extras.getAllActivePoolEntities().at(-1)
}

test("it should find a collision with a pooled entity", () => {
  const store = createGame()
  const pipe = spawn(store, v(100, 0, 100), v(70, 0, 288))

  const collision = store.extras.findCollision(store.getState().bird)

  expect(collision).toStrictEqual(pipe)
})

test("it should not collide with a pooled entity out of reach", () => {
  const store = createGame()
  spawn(store, v(400, 0, 100), v(70, 0, 288))

  expect(store.extras.findCollision(store.getState().bird)).toBeUndefined()
})

test("it should never collide with the entity itself", () => {
  const store = createGame()
  const pipe = spawn(store, v(400, 0, 400), v(70, 0, 288))

  expect(store.extras.findCollision(pipe)).toBeUndefined()
})

test("it should stop colliding once the entity is recycled", () => {
  const store = createGame()
  const pipe = spawn(store, v(100, 0, 100), v(70, 0, 288))

  store.notify("despawn", pipe)
  store.update()

  expect(store.extras.findCollision(store.getState().bird)).toBeUndefined()
})

test("it should also find collisions against the given entities", () => {
  const store = createGame({
    pipe: {
      type: "Pipe",
      position: v(100, 0, 100),
      size: v(70, 0, 288),
      collisions: { hitbox: { shape: "rectangle" } },
    },
  })

  const collision = store.extras.findCollision(
    store.getState().bird,
    store.getState(),
  )

  expect(collision.id).toBe("pipe")
})

test("it should stop delivering to a pooled entity once it is recycled", () => {
  const seen = []

  const store = createStore({
    types: {
      Brick: {
        brickHit(entity) {
          seen.push(entity.id)
        },
      },
    },
    entities: { game: { type: "Game", devMode: false } },
    middlewares: [entityPoolMiddleware()],
    updateMode: "manual",
  })

  store.notify("spawn", { type: "Brick", id: "brick", position: v(0, 0, 0) })
  store.update()
  store.notify("despawn", {
    type: "brick-entity",
    id: "brick",
    position: v(0, 0, 0),
  })
  store.update()

  store.notify("#brick:brickHit")
  store.update()

  expect(seen).toStrictEqual([])
})
