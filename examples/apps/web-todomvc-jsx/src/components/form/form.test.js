import { trigger } from "@inglorious/web"
import { expect, it } from "vitest"

import { form } from "."

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

  const { entity } = trigger(entityBefore, form[event.type], event.payload)

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

  const { entity } = trigger(entityBefore, form[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})
