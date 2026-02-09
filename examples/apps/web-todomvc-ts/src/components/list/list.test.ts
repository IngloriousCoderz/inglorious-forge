import { type Event, trigger } from "@inglorious/web"
import { expect, it } from "vitest"

import type { ListEntity, ListType } from "../../../types"
import { list } from "./list"

it("should add a new task on formSubmit", () => {
  const entityBefore: ListEntity = { id: "list", type: "list", tasks: [] }
  const event: Event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter: ListEntity = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!" }],
  }

  const { entity } = trigger(
    entityBefore,
    list[event.type as keyof typeof list] as ListType["formSubmit"],
    event.payload,
  ) as unknown as { entity: ListEntity }

  expect(entity).toEqual(entityAfter)
})

it("should toggle a task as completed on toggleClick", () => {
  const entityBefore: ListEntity = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event: Event = { type: "toggleClick", payload: 1 }
  const entityAfter: ListEntity = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }

  const { entity } = trigger(
    entityBefore,
    list[event.type as keyof typeof list] as ListType["toggleClick"],
    event.payload,
  ) as unknown as { entity: ListEntity }

  expect(entity).toEqual(entityAfter)
})

it("should delete a task on deleteClick", () => {
  const entityBefore: ListEntity = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: false }],
  }
  const event: Event = { type: "deleteClick", payload: 1 }
  const entityAfter: ListEntity = { id: "list", type: "list", tasks: [] }

  const { entity } = trigger(
    entityBefore,
    list[event.type as keyof typeof list] as ListType["deleteClick"],
    event.payload,
  ) as unknown as ListEntity

  expect(entity).toEqual(entityAfter)
})

it("should clear all completed tasks on clearClick", () => {
  const entityBefore: ListEntity = {
    id: "list",
    type: "list",
    tasks: [{ id: 1, text: "Hello world!", completed: true }],
  }
  const event: Event = { type: "clearClick" }
  const entityAfter: ListEntity = {
    id: "list",
    type: "list",
    tasks: [],
  }

  const { entity } = trigger(
    entityBefore,
    list[event.type as keyof typeof list] as ListType["clearClick"],
    event.payload,
  ) as unknown as ListEntity

  expect(entity).toEqual(entityAfter)
})
