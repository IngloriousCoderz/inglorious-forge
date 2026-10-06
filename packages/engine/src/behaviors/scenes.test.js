import { createStore } from "@inglorious/store/store.js"
import { expect, test } from "vitest"

import { fsm } from "./fsm.js"
import { scenes } from "./scenes.js"

const ids = (store) => Object.keys(store.getState())

const SCENES = {
  title: () => [{ id: "title", type: "Text" }],
  play: () => [
    { id: "paddle", type: "Paddle" },
    { id: "ball", type: "Ball" },
  ],
}

const config = (scenesByState = SCENES) => ({
  types: {
    Game: [
      scenes(scenesByState),
      fsm({
        title: {
          start(entity) {
            entity.state = "play"
          },
          vanish(entity) {
            // A state the scene map knows nothing about, which is a state the machine can
            // still be in.
            entity.state = "nowhere"
          },
        },
        play: {
          stop(entity) {
            entity.state = "title"
          },
        },
      }),
    ],
  },
  entities: {
    game: { type: "Game", state: "title" },
  },
})

test("it should put a state's entities up when the entity is made", () => {
  const store = createStore(config())
  store.update()

  expect(ids(store)).toStrictEqual(["game", "title"])
})

test("it should take the last state down when the machine moves", () => {
  const store = createStore(config())
  store.update()

  store.notify("start")
  store.update()

  expect(ids(store)).toStrictEqual(["game", "paddle", "ball"])
})

test("it should put the previous state back", () => {
  const store = createStore(config())
  store.update()
  store.notify("start")
  store.update()
  store.notify("stop")
  store.update()

  expect(ids(store)).toStrictEqual(["game", "title"])
})

test("it should leave what two states share standing", () => {
  // The paddle belongs to both states, and standing through the move is the whole point:
  // it keeps its position, and anything it has done to itself.
  const shared = {
    title: () => [{ id: "paddle", type: "Paddle" }],
    play: () => [
      { id: "paddle", type: "Paddle" },
      { id: "ball", type: "Ball" },
    ],
  }
  const store = createStore(config(shared))
  store.update()
  store.getState().paddle.position = [7, 9, 0]

  store.notify("start")
  store.update()

  expect(store.getState().paddle.position).toStrictEqual([7, 9, 0])
  expect(ids(store)).toStrictEqual(["game", "paddle", "ball"])
})

test("it should not re-add what is already standing", () => {
  let made = 0
  const counting = {
    title: () => [{ id: "paddle", type: "Paddle", made: ++made }],
    play: () => [
      { id: "paddle", type: "Paddle", made: ++made },
      { id: "ball", type: "Ball" },
    ],
  }
  const store = createStore(config(counting))
  store.update()
  store.notify("start")
  store.update()

  // The paddle standing is the one the title scene put up, numbered one, rather than the
  // second one the play scene would have added.
  expect(store.getState().paddle.made).toBe(1)
})

test("it should stand nothing for a state it does not know", () => {
  const store = createStore(config())
  store.update()

  store.notify("vanish")
  store.update()

  expect(store.getState().game.state).toBe("nowhere")
  expect(ids(store)).toStrictEqual(["game"])
})

test("it should ignore another entity's machine moving", () => {
  const twoMachines = {
    ...config().types,
  }
  twoMachines.Other = [scenes(SCENES)]
  const store = createStore({
    types: twoMachines,
    entities: {
      game: { type: "Game", state: "title" },
      other: { type: "Other", state: "play" },
    },
  })
  store.update()

  expect(ids(store).sort()).toStrictEqual([
    "ball",
    "game",
    "other",
    "paddle",
    "title",
  ])
})

test("it should let a state prepare what the next one stands", () => {
  // Some of what a state stands is only worth making once, and it is asked for when the
  // state that needs it is entered rather than listed anywhere.
  let made = 0
  const lazy = {
    title: () => [{ id: "title", type: "Text" }],
    play: (entity) => {
      entity.level ??= [{ id: "brick1", type: "Brick", made: ++made }]

      return [{ id: "paddle", type: "Paddle" }, ...entity.level]
    },
  }
  const store = createStore(config(lazy))
  store.update()
  store.notify("start")
  store.update()

  // Losing the level is how a round ends; coming back for it must not make another.
  store.notify("stop")
  store.update()
  store.notify("start")
  store.update()

  expect(store.getState().brick1.made).toBe(1)
  expect(ids(store)).toStrictEqual(["game", "paddle", "brick1"])
})
