import { beforeEach, expect, test, vi } from "vitest"

import { createKeyboardEntity, keyboard } from "./keyboard.js"

let listeners

beforeEach(() => {
  listeners = {}

  // The behaviour reads `document` when it is created, so the listeners it
  // registers are captured here rather than attached to anything real.
  vi.stubGlobal("document", {
    body: {},
    addEventListener: (name, handler) => {
      listeners[name] = handler
    },
    removeEventListener: () => {},
  })
})

function press(properties) {
  const api = { notify: vi.fn() }
  const type = keyboard()
  const entity = createKeyboardEntity("game", { KeyW: "moveUp" })

  type.create(entity, null, api)
  listeners.keydown({ stopPropagation: () => {}, ...properties })

  return { api, entity, type }
}

function release(properties) {
  const api = { notify: vi.fn() }
  const type = keyboard()
  const entity = createKeyboardEntity("game", { KeyW: "moveUp" })

  type.create(entity, null, api)
  listeners.keyup({ stopPropagation: () => {}, ...properties })

  return api
}

test("it should report a key by its physical code", () => {
  const { api } = press({ code: "KeyW", key: "w" })

  expect(api.notify).toHaveBeenCalledWith("keyboardKeyDown", "KeyW")
})

test("it should report the character a key produced", () => {
  const { api } = press({ code: "KeyW", key: "w" })

  expect(api.notify).toHaveBeenCalledWith("keyboardChar", {
    targetId: "game",
    character: "w",
  })
})

test("it should report the shifted character, while the code stays put", () => {
  const { api } = press({ code: "KeyW", key: "W" })

  expect(api.notify).toHaveBeenCalledWith("keyboardChar", {
    targetId: "game",
    character: "W",
  })
  expect(api.notify).toHaveBeenCalledWith("keyboardKeyDown", "KeyW")
})

test("it should report the character the layout produces", () => {
  // AZERTY: the key a QWERTY user reaches for A produces Q.
  const { api } = press({ code: "KeyQ", key: "q" })

  expect(api.notify).toHaveBeenCalledWith("keyboardChar", {
    targetId: "game",
    character: "q",
  })
  expect(api.notify).toHaveBeenCalledWith("keyboardKeyDown", "KeyQ")
})

test.each([
  ["Shift", "a modifier"],
  ["Enter", "a named key"],
  ["ArrowLeft", "navigation"],
  ["F1", "a function key"],
  ["Dead", "a dead key for an accent"],
])("it should not report %s as a character, being %s", (key) => {
  const { api } = press({ code: key, key })

  expect(api.notify).not.toHaveBeenCalledWith("keyboardChar", expect.anything())
  // It is still a key press, so the code-based mapping gets a look at it.
  expect(api.notify).toHaveBeenCalledWith("keyboardKeyDown", key)
})

test.each([
  ["Space", " "],
  ["Digit1", "1"],
  ["Comma", ","],
])("it should report %s as the character %j", (code, character) => {
  const { api } = press({ code, key: character })

  expect(api.notify).toHaveBeenCalledWith("keyboardChar", {
    targetId: "game",
    character,
  })
})

test("it should not report a character on key up", () => {
  const api = release({ code: "KeyW", key: "w" })

  expect(api.notify).toHaveBeenCalledWith("keyboardKeyUp", "KeyW")
  expect(api.notify).not.toHaveBeenCalledWith("keyboardChar", expect.anything())
})

test("it should still map actions by code and hold them until key up", () => {
  const api = { notify: vi.fn() }
  const type = keyboard()
  const entity = createKeyboardEntity("game", { KeyW: "moveUp" })

  type.create(entity, null, api)
  type.keyboardKeyDown(entity, "KeyW", api)

  expect(entity.moveUp).toBe(true)
  expect(api.notify).toHaveBeenCalledWith("inputPress", {
    targetId: "game",
    action: "moveUp",
  })

  type.keyboardKeyUp(entity, "KeyW", api)

  expect(entity.moveUp).toBe(false)
  expect(api.notify).toHaveBeenCalledWith("inputRelease", {
    targetId: "game",
    action: "moveUp",
  })
})
