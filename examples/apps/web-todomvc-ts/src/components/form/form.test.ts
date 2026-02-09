import { type Event, trigger } from "@inglorious/web"
import { expect, it } from "vitest"

import type { FormEntity, FormType } from "../../../types"
import { form } from "./form"

it("should update the form value on inputChange", () => {
  const entityBefore: FormEntity = {
    id: "form",
    type: "form",
    value: "",
  }
  const event: Event = { type: "inputChange", payload: "Hello world!" }
  const entityAfter: FormEntity = {
    id: "form",
    type: "form",
    value: "Hello world!",
  }

  const { entity } = trigger(
    entityBefore,
    form[event.type as keyof typeof form] as FormType["inputChange"],
    event.payload,
  ) as unknown as { entity: FormEntity }

  expect(entity).toEqual(entityAfter)
})

it("should clear the form value on formSubmit", () => {
  const entityBefore: FormEntity = {
    id: "form",
    type: "form",
    value: "Hello world!",
  }
  const event: Event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter: FormEntity = {
    id: "form",
    type: "form",
    value: "",
  }

  const { entity } = trigger(
    entityBefore,
    form[event.type as keyof typeof form] as FormType["formSubmit"],
    event.payload,
  ) as unknown as { entity: FormEntity }

  expect(entity).toEqual(entityAfter)
})
