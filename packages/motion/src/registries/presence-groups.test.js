import { expect, test } from "vitest"

import { createPresenceGroupRegistry } from "./presence-groups.js"

test("presence registry queues waiters for same group", async () => {
  const registry = createPresenceGroupRegistry()
  const steps = []

  await registry.acquire("g")
  steps.push("first-acquired")

  const second = registry.acquire("g").then(() => {
    steps.push("second-acquired")
  })

  await Promise.resolve()
  expect(steps).toEqual(["first-acquired"])

  registry.release("g")
  await second

  expect(steps).toEqual(["first-acquired", "second-acquired"])
})
