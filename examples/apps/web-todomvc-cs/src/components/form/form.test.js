import { trigger } from "@inglorious/web/test"
import { expect, it } from "vitest"

import * as handlers from "./handlers"

it("should update the form value on inputChange", () => {
  const entityBefore = {
    id: "form",
    type: "form",
    value: "",
  }
  const event = { type: "inputChange", payload: "Hello world!" }
  const entityAfter = {
    id: "form",
    type: "form",
    value: "Hello world!",
  }

  const { entity } = trigger(entityBefore, handlers[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})

it("should clear the form value on formSubmit", () => {
  const entityBefore = {
    id: "form",
    type: "form",
    value: "Hello world!",
  }
  const event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter = {
    id: "form",
    type: "form",
    value: "",
  }

  const { entity } = trigger(entityBefore, handlers[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})
