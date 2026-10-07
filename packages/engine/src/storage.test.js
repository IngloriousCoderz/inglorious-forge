import { beforeEach, expect, test } from "vitest"

import { readJSON, writeJSON } from "./storage.js"

let storage

beforeEach(() => {
  storage = new Map()

  storage.getItem = (key) => (storage.has(key) ? storage.get(key) : null)
  storage.setItem = (key, value) => storage.set(key, String(value))
})

test("it should read back what it wrote", () => {
  writeJSON("scores", [1, 2, 3], storage)

  expect(readJSON("scores", null, storage)).toEqual([1, 2, 3])
})

test("it should read objects as well as arrays", () => {
  writeJSON("name", { name: "AAA", score: 100 }, storage)

  expect(readJSON("name", null, storage)).toEqual({ name: "AAA", score: 100 })
})

test("it should answer with the fallback when nothing is stored", () => {
  expect(readJSON("missing", "fallback", storage)).toBe("fallback")
})

test("it should answer with the fallback when what is stored cannot be parsed", () => {
  storage.setItem("broken", "{not json")

  expect(readJSON("broken", "fallback", storage)).toBe("fallback")
})

test("it should not throw where there is no storage at all", () => {
  expect(readJSON("name", "fallback", null)).toBe("fallback")
  expect(writeJSON("name", 1, null)).toBe(true)
})

test("it should report a write that is refused", () => {
  const refusing = {
    getItem: () => null,
    setItem: () => {
      throw new Error("quota exceeded")
    },
  }

  expect(writeJSON("name", 1, refusing)).toBe(false)
})
