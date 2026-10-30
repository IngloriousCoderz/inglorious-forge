import { expect, test } from "vitest"

import { createStore } from "../../store.js"
import { fsm } from "./fsm.js"
import { scenes } from "./scenes.js"

const ids = (store) => Object.keys(store.getState())

const SCENES = {
  title: () => [{ id: "title", type: "Text" }],
  play: () => [
    { id: "actor", type: "Actor" },
    { id: "body", type: "Body" },
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

  expect(ids(store)).toStrictEqual(["game", "actor", "body"])
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
  const shared = {
    title: () => [{ id: "actor", type: "Actor" }],
    play: () => [
      { id: "actor", type: "Actor" },
      { id: "body", type: "Body" },
    ],
  }
  const store = createStore(config(shared))
  store.update()
  store.getState().actor.position = [7, 9, 0]

  store.notify("start")
  store.update()

  expect(store.getState().actor.position).toStrictEqual([7, 9, 0])
  expect(ids(store)).toStrictEqual(["game", "actor", "body"])
})

test("it should not re-add what is already standing", () => {
  let made = 0
  const Actor = {
    create() {
      made++
    },
  }
  const scenes = {
    title: () => [{ id: "actor", type: "Actor" }],
    play: () => [
      { id: "actor", type: "Actor" },
      { id: "body", type: "Body" },
    ],
  }
  const store = createStore({
    ...config(scenes),
    types: { ...config(scenes).types, Actor },
  })

  store.update()
  store.notify("start")
  store.update()

  expect(made).toBe(1)
  expect(ids(store)).toStrictEqual(["game", "actor", "body"])
})

test("it should patch what is standing when the next state wants it different", () => {
  let made = 0
  const Keyboard = {
    create() {
      made++
    },
  }
  const scenes = {
    menu: () => [
      { id: "keyboard", type: "Keyboard", mapping: { Escape: "quit" } },
    ],
    play: () => [
      { id: "keyboard", type: "Keyboard", mapping: { Escape: "pause" } },
      { id: "actor", type: "Actor" },
    ],
  }
  const store = createStore({
    ...config(scenes),
    types: { ...config(scenes).types, Keyboard },
  })

  store.update()
  store.notify("start")
  store.update()

  expect(made).toBe(1)
  expect(ids(store)).toStrictEqual(["game", "keyboard", "actor"])
  expect(store.getState().keyboard.mapping).toStrictEqual({ Escape: "pause" })
})

test("it should leave standing alone what the next state wants unchanged", () => {
  const scenes = {
    title: () => [{ id: "actor", type: "Actor" }],
    play: () => [
      { id: "actor", type: "Actor" },
      { id: "body", type: "Body" },
    ],
  }
  const store = createStore(config(scenes))

  store.update()
  store.getState().actor.position = [7, 9, 0]
  store.notify("start")
  store.update()

  expect(store.getState().actor.position).toStrictEqual([7, 9, 0])
})

test("it should take a key off a mapping when a state maps it to nothing", () => {
  const scenes = {
    title: () => [
      {
        id: "keyboard",
        type: "Keyboard",
        mapping: { Escape: "quit", ArrowUp: "up" },
      },
    ],
    play: () => [
      {
        id: "keyboard",
        type: "Keyboard",
        mapping: { Escape: "pause", ArrowUp: undefined },
      },
    ],
  }
  const store = createStore(config(scenes))

  store.update()
  store.notify("start")
  store.update()

  const mapping = store.getState().keyboard.mapping

  expect(mapping.Escape).toBe("pause")
  expect(Object.hasOwn(mapping, "ArrowUp")).toBe(true)
  expect(mapping.ArrowUp).toBeUndefined()
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
    "actor",
    "body",
    "game",
    "other",
    "title",
  ])
})

test("it should let a state prepare what the next one stands", () => {
  let made = 0
  const lazy = {
    title: () => [{ id: "title", type: "Text" }],
    play: (entity) => {
      entity.stage ??= [{ id: "brick1", type: "Thing", made: ++made }]

      return [{ id: "actor", type: "Actor" }, ...entity.stage]
    },
  }
  const store = createStore(config(lazy))
  store.update()
  store.notify("start")
  store.update()

  store.notify("stop")
  store.update()
  store.notify("start")
  store.update()

  expect(store.getState().brick1.made).toBe(1)
  expect(ids(store)).toStrictEqual(["game", "actor", "brick1"])
})
