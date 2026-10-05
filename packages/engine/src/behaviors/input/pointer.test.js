import { v } from "@inglorious/utils/v.js"
import { expect, test, vi } from "vitest"

import { createPointerEntity, pointer } from "./pointer.js"

const createApi = () => ({ notify: vi.fn() })

test("it should bind the target and its actions", () => {
  expect(createPointerEntity(["press"])).toStrictEqual({
    type: "Pointer",
    actions: ["press"],
  })
})

test("it should bind no action by default", () => {
  expect(createPointerEntity().actions).toStrictEqual([])
})

test("it should press and release every action on a click", () => {
  const entity = { actions: ["flap", "start"] }
  const api = createApi()

  pointer().mouseClick(entity, v(10, 0, 20), api)

  expect(api.notify.mock.calls).toStrictEqual([
    ["inputPress", { action: "flap" }],
    ["inputPress", { action: "start" }],
    ["inputRelease", { action: "flap" }],
    ["inputRelease", { action: "start" }],
  ])
})

test("it should press on touch start and release on touch end", () => {
  const entity = { actions: ["flap"] }
  const api = createApi()

  pointer().touchStart(entity, { index: 0, position: v(10, 0, 20) }, api)
  pointer().touchEnd(entity, { index: 0, position: v(10, 0, 20) }, api)

  expect(api.notify.mock.calls).toStrictEqual([
    ["inputPress", { action: "flap" }],
    ["inputRelease", { action: "flap" }],
  ])
})

test("it should notify nothing when no action is bound", () => {
  const entity = { actions: [] }
  const api = createApi()

  pointer().mouseClick(entity, v(10, 0, 20), api)

  expect(api.notify).not.toHaveBeenCalled()
})
