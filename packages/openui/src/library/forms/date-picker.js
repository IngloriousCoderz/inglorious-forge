import { Flex } from "@inglorious/ui/flex"
import { Input as UiInput } from "@inglorious/ui/input"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { renderError, renderLabel, rules } from "./helpers.js"

export const DatePicker = defineComponent({
  name: "DatePicker",
  description:
    'A date field. Its value is a date as "2026-10-27", or with mode "range" an object {from, to} of two.',
  props: z.object({
    name: z.string(),
    mode: z.enum(["single", "range"]).optional(),
    rules,
    value: reactive(z.unknown().optional()),
  }),
  component: ({ props, isStreaming, stateField, fieldError, label, hint }) => {
    const field = stateField(props.name, props.value)
    const error = fieldError(props.name)
    const dateField = (options) =>
      UiInput.render({
        inputType: "date",
        isRequired: props.rules?.required,
        isDisabled: isStreaming,
        isFullWidth: true,
        ...options,
      })

    if (props.mode !== "range") {
      return dateField({
        name: props.name,
        label,
        hint,
        value: field.value ?? "",
        error,
        onChange: field.setValue,
      })
    }

    const range = field.value ?? {}
    return Flex.render({
      direction: "column",
      gap: "xs",
      children: [
        renderLabel(label),
        Flex.render({
          direction: "row",
          gap: "sm",
          wrap: "wrap",
          children: [
            dateField({
              name: `${props.name}-from`,
              label: "From",
              value: range.from ?? "",
              onChange: (from) => field.setValue({ ...range, from }),
            }),
            dateField({
              name: `${props.name}-to`,
              label: "To",
              value: range.to ?? "",
              onChange: (to) => field.setValue({ ...range, to }),
            }),
          ],
        }),
        renderError(error),
      ],
    })
  },
})
