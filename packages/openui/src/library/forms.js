import { Input as UiInput } from "@inglorious/ui/input"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../reactive.js"

export const Input = defineComponent({
  name: "Input",
  description:
    'A text field. Bind value to a $variable to filter or search with it: Input("search", "Search…", "text", $query)',
  props: z.object({
    name: z.string(),
    placeholder: z.string().optional(),
    type: z.enum(["text", "email", "password", "number", "url"]).optional(),
    value: reactive(z.string().optional()),
  }),
  component: ({ props, isStreaming, stateField }) => {
    const field = stateField(props.name, props.value)
    return UiInput.render({
      name: props.name,
      placeholder: props.placeholder,
      inputType: props.type ?? "text",
      value: field.value ?? "",
      isDisabled: isStreaming,
      isFullWidth: true,
      onChange: field.setValue,
    })
  },
})
