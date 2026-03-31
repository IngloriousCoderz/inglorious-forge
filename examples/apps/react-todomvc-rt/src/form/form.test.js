import { it, expect } from "vitest"
import { trigger } from "@inglorious/store/test"

import { Form } from "./form"

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

  const { entity } = trigger(entityBefore, Form[event.type], event.payload)

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

  const { entity } = trigger(entityBefore, Form[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})
