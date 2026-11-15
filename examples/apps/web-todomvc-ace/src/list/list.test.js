import { trigger } from "@inglorious/web/test"
import { expect, it } from "vitest"

import { List } from "./list"

it("should add a new task on formSubmit", () => {
  const entityBefore = { id: "list", type: "List", tasks: [] }
  const event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!" }],
  }

  const { entity } = trigger(entityBefore, List[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should toggle a task as completed on taskToggle", () => {
  const entityBefore = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event = { type: "taskToggle", payload: 1 }
  const entityAfter = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }

  const { entity } = trigger(entityBefore, List[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should delete a task on taskDelete", () => {
  const entityBefore = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event = { type: "taskDelete", payload: 1 }
  const entityAfter = { id: "list", type: "List", tasks: [] }

  const { entity } = trigger(entityBefore, List[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should clear all completed tasks on completedClear", () => {
  const entityBefore = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }
  const event = { type: "completedClear" }
  const entityAfter = {
    id: "list",
    type: "List",
    tasks: [],
  }

  const { entity } = trigger(entityBefore, List[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})
