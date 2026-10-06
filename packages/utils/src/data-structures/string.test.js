import { expect, test } from "vitest"

import { editDistance, namesNear, toCamelCase } from "./string.js"

test("it should convert kebab-case to camelCase", () => {
  expect(toCamelCase("my-element")).toBe("myElement")
})

test("it should convert PascalCase to camelCase", () => {
  expect(toCamelCase("MyElement")).toBe("myElement")
})

test("it should leave already camelCase strings unchanged", () => {
  expect(toCamelCase("myElement")).toBe("myElement")
})

test("it should count how far one string is from another", () => {
  expect(editDistance("audio", "audio")).toBe(0)
  expect(editDistance("audio", "audi")).toBe(1)
  expect(editDistance("kitty", "elephant")).toBeGreaterThan(3)
})

test("it should ignore case when looking for the name that was meant", () => {
  // The distance itself counts characters, so it sees a capital as a difference. It is
  // `namesNear` that folds case, which is where a case can be the whole of a mistake.
  expect(editDistance("audio", "Audio")).toBe(1)
  expect(namesNear("audio", ["Audio"])).toStrictEqual(["Audio"])
})

test("it should suggest the name that was nearly meant", () => {
  const declared = ["Game", "Audio", "Paddle", "Ball"]

  expect(namesNear("audio", declared)).toStrictEqual(["Audio"])
  expect(namesNear("Padle", declared)).toStrictEqual(["Paddle"])
})

test("it should not suggest a name that is nothing like", () => {
  expect(namesNear("elephant", ["Game", "Audio"])).toStrictEqual([])
})
