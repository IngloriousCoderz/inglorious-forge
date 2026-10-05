import { v } from "@inglorious/utils/v.js"
import { beforeEach, expect, test, vi } from "vitest"

import { Engine } from "../../core/engine.js"
import { controlTypes, createControlEntities } from "./controls.js"

// The engine builds its AudioContext while loading, so the globals have to be in
// place before any import is evaluated.
vi.hoisted(() => {
  const noop = () => {}

  vi.stubGlobal("window", {
    AudioContext: class {
      constructor() {
        this.state = "running"
        this.destination = {}
      }
      resume() {}
      createGain() {
        return { gain: { value: 1 }, connect: noop }
      }
      createBufferSource() {
        return { connect: noop, start: noop, stop: noop }
      }
    },
    addEventListener: noop,
    removeEventListener: noop,
    cancelAnimationFrame: noop,
    requestAnimationFrame: noop,
    location: { hostname: "localhost", host: "localhost:3000", port: "3000" },
  })
})

beforeEach(() => {
  vi.stubGlobal("document", {
    body: { ownerDocument: { addEventListener: vi.fn() } },
  })
  vi.stubGlobal("navigator", { getGamepads: () => [] })
})

const isList = (value) => Array.isArray(value)

test("it should define each control type as a bare behavior", () => {
  const types = controlTypes()

  expect(Object.keys(types)).toStrictEqual([
    "Keyboard",
    "Pointer",
    "GamepadsPoller",
    "Gamepad",
    "Input",
  ])
  // The engine only appends to a type that is already a list, which is how a game
  // keeps the built-in behaviors. Nothing composes onto these types, so a list
  // here would be one behaviour wrapped for nothing.
  Object.values(types).forEach((behavior) =>
    expect(isList(behavior)).toBe(false),
  )
})

test("it should wire a game up from the types and entities alone", () => {
  const engine = new Engine({
    types: { ...controlTypes() },
    entities: {
      ...createControlEntities({ Space: "press" }, ["press"]),
      game: { type: "Game", devMode: false, size: v(512, 288, 0) },
    },
  })

  expect(Object.keys(engine._store.getType("Keyboard"))).toContain(
    "keyboardKeyDown",
  )
  expect(engine.getState().keyboard.type).toBe("Keyboard")
})

test("a game should still be able to add to a control type", () => {
  const engine = new Engine({
    types: {
      ...controlTypes(),
      // Listing the behaviors is how you compose onto a type the engine does not
      // already own, so the keyboard keeps its own handlers and gains yours.
      Keyboard: [controlTypes().Keyboard, { birdHit: () => {} }],
    },
    entities: {
      ...createControlEntities(),
      game: { type: "Game", devMode: false, size: v(512, 288, 0) },
    },
  })

  expect(Object.keys(engine._store.getType("Keyboard")).sort()).toStrictEqual([
    "birdHit",
    "create",
    "keyboardKeyDown",
    "keyboardKeyUp",
    "stop",
  ])
})

test("it should name the control entities for what they are", () => {
  const entities = createControlEntities({ Space: "press" }, ["go"])

  // One of each per game, named for its job rather than for whoever it reports to.
  expect(Object.keys(entities).sort()).toStrictEqual([
    "gamepad",
    "gamepads",
    "input",
    "keyboard",
    "pointer",
  ])
  expect(entities.gamepads).toStrictEqual({ type: "GamepadsPoller" })
  expect(entities.keyboard).toStrictEqual({
    type: "Keyboard",
    mapping: { Space: "press" },
  })
  expect(entities.pointer.actions).toStrictEqual(["go"])
})
