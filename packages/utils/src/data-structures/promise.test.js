import { expect, test } from "vitest"

import { asSettled } from "./promise.js"

const SLOW = 20
const FAST = 5

test("it should yield results in the order they settle", async () => {
  const results = []

  for await (const value of asSettled([
    after(SLOW, "slow"),
    after(FAST, "fast"),
    "ready",
  ])) {
    results.push(value)
  }

  expect(results).toStrictEqual(["ready", "fast", "slow"])
})

test("it should throw the first rejection", async () => {
  const results = []

  const iterate = async () => {
    for await (const value of asSettled([
      after(FAST, "fast"),
      failAfter(SLOW, "broken"),
    ])) {
      results.push(value)
    }
  }

  await expect(iterate()).rejects.toThrow("broken")
  expect(results).toStrictEqual(["fast"])
})

test("it should leave no rejection unhandled when several fail", async () => {
  const unhandled = []
  const onUnhandled = (reason) => unhandled.push(reason)
  process.on("unhandledRejection", onUnhandled)

  const iterate = async () => {
    for await (const value of asSettled([
      failAfter(FAST, "first"),
      failAfter(FAST, "second"),
    ])) {
      expect.unreachable(value)
    }
  }

  await expect(iterate()).rejects.toThrow("first")
  await after(SLOW)
  process.off("unhandledRejection", onUnhandled)

  expect(unhandled).toStrictEqual([])
})

test("it should yield nothing for no promises", async () => {
  const results = []

  for await (const value of asSettled([])) {
    results.push(value)
  }

  expect(results).toStrictEqual([])
})

function after(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function failAfter(ms, message) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms),
  )
}
