import { afterEach, beforeEach, expect, test, vi } from "vitest"

import { readJSON, writeJSON } from "./storage.js"

let storage

beforeEach(() => {
  storage = new Map()

  storage.getItem = (key) => (storage.has(key) ? storage.get(key) : null)
  storage.setItem = (key, value) => storage.set(key, String(value))
})

afterEach(() => {
  vi.unstubAllGlobals()
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

test("it should not throw, and say it wrote nothing, where there is no storage at all", () => {
  vi.stubGlobal("localStorage", undefined)

  expect(readJSON("name", "fallback")).toBe("fallback")
  expect(writeJSON("name", 1)).toBe(false)
})

test("it should not throw where storage refuses to be read or written", () => {
  storage.getItem = () => {
    throw new Error("SecurityError")
  }
  storage.setItem = () => {
    throw new Error("QuotaExceededError")
  }

  expect(readJSON("name", "fallback", storage)).toBe("fallback")
  expect(writeJSON("name", 1, storage)).toBe(false)
})

test("it should use the browser's storage by default", () => {
  vi.stubGlobal("localStorage", storage)

  writeJSON("level", 3)

  expect(readJSON("level", 0)).toBe(3)
})
