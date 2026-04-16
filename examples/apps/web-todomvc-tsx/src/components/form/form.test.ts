import type { Event } from "@inglorious/store"
import { trigger } from "@inglorious/web/test"
import { expect, it } from "vitest"

import type { FormEntity, FormType } from "../../../types"
import { Form } from "./form"

it("should update the form value on inputChange", () => {
  const entityBefore: FormEntity = {
    id: "form",
    type: "Form",
    value: "",
  }
  const event: Event = { type: "inputChange", payload: "Hello world!" }
  const entityAfter: FormEntity = {
    id: "form",
    type: "Form",
    value: "Hello world!",
  }

  const { entity } = trigger(
    entityBefore,
    Form[event.type as keyof typeof Form] as FormType["inputChange"],
    event.payload,
  ) as unknown as { entity: FormEntity }

  expect(entity).toEqual(entityAfter)
})

it("should clear the form value on formSubmit", () => {
  const entityBefore: FormEntity = {
    id: "form",
    type: "Form",
    value: "Hello world!",
  }
  const event: Event = { type: "formSubmit", payload: "Hello world!" }
  const entityAfter: FormEntity = {
    id: "form",
    type: "Form",
    value: "",
  }

  const { entity } = trigger(
    entityBefore,
    Form[event.type as keyof typeof Form] as FormType["formSubmit"],
    event.payload,
  ) as unknown as { entity: FormEntity }

  expect(entity).toEqual(entityAfter)
})
