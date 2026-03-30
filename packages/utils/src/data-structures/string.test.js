import { expect, test } from "vitest"

import { toCamelCase } from "./string.js"

test("it should convert kebab-case to camelCase", () => {
  expect(toCamelCase("my-element")).toBe("myElement")
})

test("it should convert PascalCase to camelCase", () => {
  expect(toCamelCase("MyElement")).toBe("myElement")
})

test("it should leave already camelCase strings unchanged", () => {
  expect(toCamelCase("myElement")).toBe("myElement")
})
