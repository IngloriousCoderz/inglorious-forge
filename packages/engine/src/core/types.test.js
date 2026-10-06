import { expect, test } from "vitest"

import { assertTypesAreDeclared } from "./types.js"

test("it should say nothing about a configuration that is in order", () => {
  expect(() =>
    assertTypesAreDeclared({
      types: { Game: [], Audio: [] },
      entities: { game: { type: "Game" }, audio: { type: "Audio" } },
    }),
  ).not.toThrow()
})

test("it should refuse a configuration whose entity names no type", () => {
  // This is the case that went unnoticed for so long: the entity stands there with an
  // empty type, and every event sent to it goes nowhere.
  expect(() =>
    assertTypesAreDeclared({
      types: { Game: [] },
      entities: { game: { type: "Game" }, audio: { type: "audio" } },
    }),
  ).toThrow(/audio/)
})

test("it should say which name was nearly meant", () => {
  expect(() =>
    assertTypesAreDeclared({
      types: { Game: [], Audio: [] },
      entities: { audio: { type: "audio" } },
    }),
  ).toThrow(/"Audio"/)
})

test("it should say which entity and which type", () => {
  let message = ""

  try {
    assertTypesAreDeclared({
      types: { Game: [] },
      entities: { speaker: { type: "Soundz" } },
    })
  } catch (error) {
    message = error.message
  }

  expect(message).toMatch(/speaker/)
  expect(message).toMatch(/"Soundz"/)
})

test("it should say every entity that is wrong, not just the first", () => {
  let message = ""

  try {
    assertTypesAreDeclared({
      types: { Game: [] },
      entities: {
        audio: { type: "audio" },
        speaker: { type: "Soundz" },
      },
    })
  } catch (error) {
    message = error.message
  }

  expect(message).toMatch(/2 of the entities/)
  expect(message).toMatch(/audio/)
  expect(message).toMatch(/speaker/)
})

test("it should say nothing about an entity with no type of its own", () => {
  expect(() =>
    assertTypesAreDeclared({
      types: { Game: [] },
      entities: { game: { type: "Game" }, thing: {} },
    }),
  ).not.toThrow()
})

test("it should cope with a configuration that says nothing", () => {
  expect(() => assertTypesAreDeclared({})).not.toThrow()
})
