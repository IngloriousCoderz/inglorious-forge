import { trigger } from "@inglorious/web"
import { expect, it } from "vitest"

import { list } from "."

it("should add a new task on formSubmit", () => {
  const entityBefore = { id: "list", type: "list", tasks: [] }
  const event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!" }],
  }

  const { entity } = trigger(entityBefore, list[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should toggle a task as completed on toggleClick", () => {
  const entityBefore = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event = { type: "toggleClick", payload: 1 }
  const entityAfter = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }

  const { entity } = trigger(entityBefore, list[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should delete a task on deleteClick", () => {
  const entityBefore = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event = { type: "deleteClick", payload: 1 }
  const entityAfter = { id: "list", type: "list", tasks: [] }

  const { entity } = trigger(entityBefore, list[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should clear all completed tasks on clearClick", () => {
  const entityBefore = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }
  const event = { type: "clearClick" }
  const entityAfter = {
    id: "list",
    type: "list",
    tasks: [],
  }

  const { entity } = trigger(entityBefore, list[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})
