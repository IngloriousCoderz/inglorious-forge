import { expect, test } from "vitest"

import { createStore } from "./store.js"

test("it should process events by mutating state inside handlers", () => {
  const config = {
    types: {
      Cat: {
        feed(entity) {
          entity.isFed = true
        },
      },
    },
    entities: {
      kitty1: { type: "Cat" },
    },
  }
  const afterState = {
    kitty1: {
      id: "kitty1",
      type: "Cat",
      isFed: true,
    },
  }

  const store = createStore(config)
  store.notify("feed")
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should process an event queue in the same update cycle", () => {
  const config = {
    types: {
      Cat: {
        feed(entity) {
          entity.isFed = true
        },
        update(entity) {
          entity.isMeowing = true
        },
      },
    },

    entities: {
      kitty1: { type: "Cat" },
    },
  }
  const afterState = {
    kitty1: {
      id: "kitty1",
      type: "Cat",
      isFed: true,
      isMeowing: true,
    },
  }

  const store = createStore(config)
  store.notify("feed")
  store.notify("update")
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should send an event from an entity and process it in the same update cycle in batched mode", () => {
  const config = {
    types: {
      Doggo: {
        update(entity, dt, api) {
          api.notify("bark")
        },
      },
      Cat: {
        bark(entity) {
          entity.position = "far"
        },
      },
    },

    entities: {
      doggo1: { type: "Doggo" },
      kitty1: { type: "Cat", position: "near" },
    },

    updateMode: "manual",
  }
  const afterState = {
    doggo1: { id: "doggo1", type: "Doggo" },
    kitty1: { id: "kitty1", type: "Cat", position: "far" },
  }

  const store = createStore(config)
  const api = { notify: store.notify }
  store.notify("update")
  store.update(api)

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should add an entity via an 'add' event", () => {
  const config = {
    types: {
      Cat: {},
    },
    entities: {},
  }
  const newEntity = { id: "kitty1", type: "Cat" }
  const afterState = {
    kitty1: { id: "kitty1", type: "Cat" },
  }

  const store = createStore(config)
  store.notify("add", newEntity)
  store.update()

  const state = store.getState()
  expect(state).toStrictEqual(afterState)
})

test("it should remove an entity via a 'remove' event", () => {
  const config = {
    types: {},
    entities: {
      kitty1: { type: "Cat" },
    },
  }
  const store = createStore(config)

  store.notify("remove", "kitty1")
  store.update()

  const state = store.getState()
  expect(state.kitty1).toBeUndefined()
})

test("it should change an entity's behavior via setType", () => {
  const Caterpillar = {
    eat(entity) {
      entity.isFull = true
    },
  }
  const Butterfly = {
    fly(entity) {
      entity.hasFlown = true
    },
  }

  const config = {
    types: {
      Bug: Caterpillar,
    },

    entities: {
      bug: { type: "Bug" },
    },
  }

  const store = createStore(config)

  store.notify("eat")
  store.update()

  expect(store.getState()).toStrictEqual({
    bug: { id: "bug", type: "Bug", isFull: true },
  })

  store.setType("Bug", [Caterpillar, Butterfly])
  store.notify("fly")
  store.update()
  expect(store.getState()).toStrictEqual({
    bug: { id: "bug", type: "Bug", isFull: true, hasFlown: true },
  })
})

test("it should auto-create entities when autoCreateEntities is enabled", () => {
  const config = {
    types: {
      Game: {},
      Player: {},
    },
    entities: {
      player1: { type: "Player" },
    },
    autoCreateEntities: true,
  }

  const store = createStore(config)
  const state = store.getState()

  expect(state.game).toStrictEqual({
    id: "game",
    type: "Game",
  })

  expect(state.player).toBeUndefined()
  expect(state.player1).toStrictEqual({
    id: "player1",
    type: "Player",
  })
})

const HALTED = {
  types: {
    Game: [
      {
        update(entity) {
          entity.frames = (entity.frames ?? 0) + 1
        },
      },
    ],
    Overlay: [
      {
        update(entity) {
          entity.frames++
        },
      },
    ],
  },
  entities: {
    game: { type: "Game", frames: 0 },
    overlay: { type: "Overlay", frames: 0, updatesWhilePaused: true },
  },
}

test("it should halt updates for every type", () => {
  const store = createStore(HALTED)

  store.notify("update")
  store.notify("pause")
  store.update()
  store.notify("update")
  store.update()

  expect(store.getState().game.frames).toBe(1)
})

test("it should keep updating an entity that says it updates while paused", () => {
  const store = createStore(HALTED)

  store.notify("pause")
  store.update()
  store.notify("update")
  store.update()

  expect(store.getState().game.frames).toBe(0)
  expect(store.getState().overlay.frames).toBe(1)
})

test("it should resume updates", () => {
  const store = createStore(HALTED)

  store.notify("pause")
  store.notify("resume")
  store.update()
  store.notify("update")
  store.update()

  expect(store.getState().game.frames).toBe(1)
  expect(store.getState().overlay.frames).toBe(1)
})

test("it should keep handling other events while halted", () => {
  const config = {
    types: {
      Game: [
        { update() {} },
        {
          press(entity) {
            entity.presses = (entity.presses ?? 0) + 1
          },
        },
      ],
    },
    entities: { game: { type: "Game" } },
  }
  const store = createStore(config)

  store.notify("pause")
  store.update()

  // This is the whole point of halting the update rather than every event: whatever
  // takes the pause back off has to keep receiving its events.
  store.notify("press")
  store.update()

  expect(store.getState().game.presses).toBe(1)
})

test("it should tell everything when an entity leaves, not just the thing itself", () => {
  // create and destroy are a thing's own lifecycle and reach only the thing itself. A
  // stage counting down the things it rolled needs to hear about the ones going, and there
  // is no other way to be told.
  const heard = []
  const config = {
    types: {
      Game: {
        remove(entity, id) {
          heard.push(id)
        },
      },
      Thing: {},
    },
    entities: {
      game: { type: "Game" },
      brick1: { type: "Thing" },
      brick2: { type: "Thing" },
    },
  }
  const store = createStore(config)

  store.notify("remove", "brick1")
  store.update()

  expect(heard).toStrictEqual(["brick1"])
  expect(store.getState().brick1).toBeUndefined()
})

test("it should say when an entity joins as well", () => {
  const heard = []
  const config = {
    types: {
      Game: {
        add(entity, id) {
          heard.push(id)
        },
      },
      Thing: {},
    },
    entities: { game: { type: "Game" } },
  }
  const store = createStore(config)

  store.notify("add", { id: "brick1", type: "Thing" })
  store.update()

  // A payload carries the least that can be had. A removal needs only the id, because
  // everything else can still be looked up by it; an addition carries the entity itself,
  // because there is nothing yet to look it up by.
  expect(heard).toStrictEqual([{ id: "brick1", type: "Thing" }])
})

test("it should tell a thing about its own destruction, with the thing still readable", () => {
  // `destroy` is the counterpart to `create` and reaches only the thing it is about, so
  // that a destructor reads like a destructor and not like a handler checking whether it
  // is the one being talked about. The entity is still whole when it is called, which is
  // the whole point of it being a destructor rather than a notification.
  const seen = []
  // A destructor that holds something outside the world -- a listener, a timer, a cache
  // key -- has to be able to let it go, which means reaching the type as well as the
  // entity.
  const held = { on: "the document" }
  const Thing = {
    destroy(entity) {
      seen.push([entity.id, entity.hp, held.on])

      held.on = null
    },
  }
  const config = {
    types: { Thing },
    entities: { brick1: { type: "Thing", hp: 2 } },
  }
  const store = createStore(config)

  store.notify("remove", "brick1")
  store.update()

  expect(seen).toStrictEqual([["brick1", 2, "the document"]])
  expect(held.on).toBeNull()
  expect(store.getState().brick1).toBeUndefined()
})

test("it should not require a thing to have a destructor", () => {
  const config = {
    types: { Thing: {} },
    entities: { brick1: { type: "Thing" } },
  }
  const store = createStore(config)

  expect(() => {
    store.notify("remove", "brick1")
    store.update()
  }).not.toThrow()

  expect(store.getState().brick1).toBeUndefined()
})

test("it should merge a new configuration into a thing that is already standing", () => {
  // The same thing throughout, so it is not made again -- and only what the new
  // configuration names is touched, which is what leaves a actor where the world had
  // slid it.
  let created = 0
  const config = {
    types: {
      Thing: {
        create() {
          created++
        },
      },
    },
    entities: { brick1: { type: "Thing", hp: 2, note: "as it was" } },
  }
  const store = createStore(config)

  store.update()
  store.getState().brick1.hp = 1
  store.notify("patch", { id: "brick1", note: "as it is now" })
  store.update()

  expect(created).toBe(1)
  expect(store.getState().brick1.hp).toBe(1)
  expect(store.getState().brick1.note).toBe("as it is now")
})

test("it should set a field named as nothing to nothing rather than leaving it", () => {
  // Which is how a key is taken off a mapping: naming it and giving it nothing is not the
  // same as saying nothing about it.
  const config = {
    types: { Keyboard: {} },
    entities: {
      keyboard: {
        type: "Keyboard",
        mapping: { Escape: "quit", ArrowUp: "up" },
      },
    },
  }
  const store = createStore(config)

  store.update()
  store.notify("patch", {
    id: "keyboard",
    mapping: { Escape: "pause", ArrowUp: undefined },
  })
  store.update()

  const { mapping } = store.getState().keyboard

  expect(mapping.Escape).toBe("pause")
  expect(Object.hasOwn(mapping, "ArrowUp")).toBe(true)
  expect(mapping.ArrowUp).toBeUndefined()
})

test("it should move a patched thing to the handlers of its new type", () => {
  const heard = []
  const config = {
    types: {
      Menu: { tap: () => heard.push("Menu") },
      World: { tap: () => heard.push("World") },
    },
    entities: { thing: { type: "Menu" } },
  }
  const store = createStore(config)

  store.update()
  store.notify("tap")
  store.update()

  store.notify("patch", { id: "thing", type: "World" })
  store.update()
  store.notify("tap")
  store.update()

  expect(heard).toStrictEqual(["Menu", "World"])
})

test("it should ignore a configuration for something that is not there", () => {
  const config = { types: { Thing: {} }, entities: {} }
  const store = createStore(config)

  store.update()

  expect(() => {
    store.notify("patch", { id: "nowhere", hp: 1 })
    store.update()
  }).not.toThrow()
})

test("it should install a replacement on a standing thing, dropping what it does not mention", () => {
  // `replace` is the whole of it, said to be different. What it is not told is gone -- which
  // is the whole difference between the two, since a patch leaves the rest alone.
  const config = {
    types: { Thing: {} },
    entities: { brick1: { type: "Thing", hp: 2, note: "as it was", layer: 3 } },
  }
  const store = createStore(config)

  store.update()
  store.notify("replace", { id: "brick1", type: "Thing", hp: 1 })
  store.update()

  expect(store.getState().brick1.hp).toBe(1)
  expect(Object.hasOwn(store.getState().brick1, "note")).toBe(false)
  expect(Object.hasOwn(store.getState().brick1, "layer")).toBe(false)
  // Its place in the world and its name are not part of what is being replaced.
  expect(store.getState().brick1.id).toBe("brick1")
})

test("it should not run the lifecycle again when a thing is patched or replaced", () => {
  // Neither takes the thing out of the world, so neither can make or unmake it: a thing
  // that was never removed cannot have been destroyed.
  const seen = []
  const config = {
    types: {
      Thing: {
        create: () => seen.push("create"),
        destroy: () => seen.push("destroy"),
      },
    },
    entities: { brick1: { type: "Thing" } },
  }
  const store = createStore(config)

  store.update()
  store.notify("patch", { id: "brick1", hp: 1 })
  store.update()
  store.notify("replace", { id: "brick1", hp: 2 })
  store.update()

  expect(seen).toStrictEqual(["create"])
})

test("it should move a replaced thing to the handlers of its new type", () => {
  const heard = []
  const config = {
    types: {
      Menu: { tap: () => heard.push("Menu") },
      World: { tap: () => heard.push("World") },
    },
    entities: { thing: { type: "Menu" } },
  }
  const store = createStore(config)

  store.update()
  store.notify("replace", { id: "thing", type: "World" })
  store.update()
  store.notify("tap")
  store.update()

  expect(heard).toStrictEqual(["World"])
})

test("it should ignore a patch or a replacement for something that is not there", () => {
  const store = createStore({ types: { Thing: {} }, entities: {} })

  store.update()

  expect(() => {
    store.notify("patch", { id: "nowhere", hp: 1 })
    store.notify("replace", { id: "nowhere", hp: 1 })
    store.update()
  }).not.toThrow()
})

test("it should read one entity by its id", () => {
  const store = createStore({
    entities: { user: { id: "user", type: "User", name: "Ada" } },
  })

  expect(store.getEntity("user")).toMatchObject({ name: "Ada" })
})

test("it should answer with undefined for an entity that is not there", () => {
  const store = createStore({
    entities: { user: { id: "user", type: "User" } },
  })

  expect(store.getEntity("nobody")).toBeUndefined()
})

test("it should say the same thing as the api does during a handler", () => {
  const store = createStore({
    entities: { user: { id: "user", type: "User", name: "Ada" } },
    types: {
      User: {
        read(entity) {
          seen = store.getEntity("user").name
        },
      },
    },
  })

  let seen
  store.notify("read", { id: "user" })

  expect(seen).toBe("Ada")
})
