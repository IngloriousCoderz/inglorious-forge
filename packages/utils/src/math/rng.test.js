import { expect, test } from "vitest"

import { choose, random, randomBinomial } from "./rng.js"

test("it should choose a random value from the given arguments", () => {
  const values = ["a", "b", "c"]
  const chosenValue = choose(...values)

  expect(values).toContain(chosenValue)
})

test("it should create a random number in the range [0, 1)", () => {
  const randomNumber = random()

  expect(randomNumber).toBeGreaterThanOrEqual(0)
  expect(randomNumber).toBeLessThan(1)
})

test("it should create a random integer in the range [0, 6]", () => {
  const randomNumber = random(6)

  expect(randomNumber).toBeGreaterThanOrEqual(0)
  expect(randomNumber).toBeLessThanOrEqual(6)
})

test("it should create a random integer in the range [1, 6]", () => {
  const randomNumber = random(1, 6)

  expect(randomNumber).toBeGreaterThanOrEqual(1)
  expect(randomNumber).toBeLessThanOrEqual(6)
})

test("it should create a random even number in the range [2, 6]", () => {
  const randomNumber = random(2, 6, 2)

  expect(randomNumber).toBeGreaterThanOrEqual(1)
  expect(randomNumber).toBeLessThanOrEqual(6)
  expect(randomNumber % 2).toBe(0)
})

test("it should create a random float in the range [1.5, 6.5)", () => {
  const from = 1.5
  const to = 6.5
  const randomNumber = random(from, to)

  expect(randomNumber).toBeGreaterThanOrEqual(from)
  expect(randomNumber).toBeLessThan(to)
})

test("it should create a random number in the range (-1, 1)", () => {
  const randomNumber = randomBinomial()

  expect(randomNumber).toBeGreaterThan(-1)
  expect(randomNumber).toBeLessThan(1)
})

test("it should create a random float when only one bound is a float", () => {
  // The upper bound is a whole number, which used to send this down the integer
  // path and answer only 0 or 1.
  for (let attempt = 0; attempt < 100; attempt++) {
    const randomNumber = random(0.5, 1)

    expect(randomNumber).toBeGreaterThanOrEqual(0.5)
    expect(randomNumber).toBeLessThan(1)
  }
})

test("it should keep integer ranges whole", () => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const randomNumber = random(1, 6)

    expect(Number.isInteger(randomNumber)).toBe(true)
  }
})
