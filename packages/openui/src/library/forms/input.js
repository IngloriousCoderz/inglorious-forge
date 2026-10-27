import { Input as UiInput } from "@inglorious/ui/input"
import { Textarea } from "@inglorious/ui/textarea"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { rules } from "./helpers.js"

export const Input = defineComponent({
  name: "Input",
  description:
    'A text field. Bind value to a $variable to filter or search with it: Input("search", "Search…", "text", null, $query)',
  props: z.object({
    name: z.string(),
    placeholder: z.string().optional(),
    type: z.enum(["text", "email", "password", "number", "url"]).optional(),
    rules,
    value: reactive(z.string().optional()),
  }),
  component: ({ props, isStreaming, stateField, fieldError, label, hint }) => {
    const field = stateField(props.name, props.value)
    return UiInput.render({
      name: props.name,
      label,
      hint,
      placeholder: props.placeholder,
      inputType: props.type ?? "text",
      value: field.value ?? "",
      error: fieldError(props.name),
      isRequired: props.rules?.required,
      isDisabled: isStreaming,
      isFullWidth: true,
      onChange: field.setValue,
    })
  },
})

export const TextArea = defineComponent({
  name: "TextArea",
  description: "A multi-line text field",
  props: z.object({
    name: z.string(),
    placeholder: z.string().optional(),
    rows: z.number().optional(),
    rules,
    value: reactive(z.string().optional()),
  }),
  component: ({ props, isStreaming, stateField, fieldError, label, hint }) => {
    const field = stateField(props.name, props.value)
    return Textarea.render({
      name: props.name,
      label,
      hint,
      placeholder: props.placeholder,
      rows: props.rows,
      value: field.value ?? "",
      error: fieldError(props.name),
      isRequired: props.rules?.required,
      isDisabled: isStreaming,
      isFullWidth: true,
      onChange: field.setValue,
    })
  },
})
