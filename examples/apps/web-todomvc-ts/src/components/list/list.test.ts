import type { Event } from "@inglorious/store"
import { trigger } from "@inglorious/web/test"
import { expect, it } from "vitest"

import type { ListEntity } from "../../../types"
import { List } from "./list"

it("should add a new task on formSubmit", () => {
  const entityBefore: ListEntity = { id: "list", type: "List", tasks: [] }
  const event: Event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter: ListEntity = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!" }],
  }

  const { entity } = trigger(entityBefore, List.formSubmit, event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should toggle a task as completed on toggleClick", () => {
  const entityBefore: ListEntity = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event: Event = { type: "toggleClick", payload: 1 }
  const entityAfter: ListEntity = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }

  const { entity } = trigger(entityBefore, List.toggleClick, event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should delete a task on deleteClick", () => {
  const entityBefore: ListEntity = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event: Event = { type: "deleteClick", payload: 1 }
  const entityAfter: ListEntity = { id: "list", type: "List", tasks: [] }

  const { entity } = trigger(entityBefore, List.deleteClick, event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should clear all completed tasks on clearClick", () => {
  const entityBefore: ListEntity = {
    id: "list",
    type: "List",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }
  const event: Event = { type: "clearClick" }
  const entityAfter: ListEntity = {
    id: "list",
    type: "List",
    tasks: [],
  }

  const { entity } = trigger(entityBefore, List.clearClick, event.payload)

  expect(entity).toEqual(entityAfter)
})
