import { expect, test } from "vitest"

import { createSharedLayoutRegistry } from "./shared-layout.js"

test("shared snapshot is consumed once and skips same entity", () => {
  let now = 10
  const registry = createSharedLayoutRegistry({ now: () => now })
  const rect = { left: 1, top: 2, width: 3, height: 4 }

  registry.storeSnapshot({
    id: "a",
    layoutId: "hero",
    layoutRect: rect,
  })

  expect(registry.getSnapshotRect({ id: "a", layoutId: "hero" })).toBeNull()
  expect(registry.getSnapshotRect({ id: "b", layoutId: "hero" })).toBe(rect)
  expect(registry.getSnapshotRect({ id: "c", layoutId: "hero" })).toBeNull()

  now = 20
  registry.storeSnapshot({
    id: "a",
    layoutId: "hero",
    layoutRect: rect,
  })
  now = 2_000
  expect(registry.getSnapshotRect({ id: "b", layoutId: "hero" })).toBeNull()
})
