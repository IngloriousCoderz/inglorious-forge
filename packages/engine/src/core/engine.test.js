import { v } from "@inglorious/utils/v.js"
import { beforeEach, expect, test, vi } from "vitest"

import { Engine } from "./engine.js"

// The engine builds its AudioContext while loading, so the globals have to be
// in place before any import is evaluated.
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

const config = (game = {}) => ({
  entities: { game: { type: "Game", devMode: false, ...game } },
})

test("it should compose a game type with the built-in game behavior", () => {
  const engine = new Engine({
    types: { Game: { birdHit: () => {} } },
    ...config(),
  })

  expect(Object.keys(engine._store.getType("Game")).sort()).toStrictEqual([
    "birdHit",
    "keyboardKeyUp",
    "pause",
    "quit",
    "resume",
  ])
})

test("it should compose a game type declared as a decorator", () => {
  const engine = new Engine({
    types: { Game: () => ({ create: () => {}, birdHit: () => {} }) },
    ...config(),
  })

  expect(Object.keys(engine._store.getType("Game")).sort()).toStrictEqual([
    "birdHit",
    "create",
    "keyboardKeyUp",
    "pause",
    "quit",
    "resume",
  ])
})

test("it should keep the built-in pause and resume events", () => {
  const engine = new Engine(config())

  engine._store.notify("pause")
  engine._store.update()
  expect(engine.getState().game.paused).toBe(true)

  engine._store.notify("resume")
  engine._store.update()
  expect(engine.getState().game.paused).toBe(false)
})

test("it should let the game override the default game size", () => {
  const engine = new Engine(config({ size: v(512, 0, 288) }))

  expect(engine.getState().game.size).toStrictEqual(v(512, 0, 288))
})

test("it should append the game systems to the default ones", () => {
  const update = vi.fn()
  const engine = new Engine({ ...config(), systems: [{ update }] })

  engine.update(1 / 60)

  expect(update).toHaveBeenCalled()
})

test("it should read the current state", () => {
  const engine = new Engine(config({ score: 0 }))

  expect(engine.getState().game.score).toBe(0)
})

test("it should stop when a game asks to quit", () => {
  const engine = new Engine(config())

  engine._store.notify("quit")
  engine.update(1 / 60)

  expect(engine.getState().game.quit).toBe(true)
})

test("it should stop the loop on the frame a quit is answered", () => {
  const engine = new Engine(config())
  engine.stop = vi.fn()

  engine._store.notify("quit")
  engine.update(1 / 60)

  expect(engine.stop).toHaveBeenCalled()
})

test("it should not move the world after a quit has been answered", () => {
  const update = vi.fn()
  const engine = new Engine({ ...config(), systems: [{ update }] })

  engine._store.notify("quit")
  engine.update(1 / 60)
  update.mockClear()

  engine.update(1 / 60)
  engine.update(1 / 60)

  expect(update).not.toHaveBeenCalled()
})

test("it should keep running when nobody has asked to quit", () => {
  const stop = vi.fn()
  const engine = new Engine(config())

  engine.stop = stop
  engine.update(1 / 60)

  expect(stop).not.toHaveBeenCalled()
})
