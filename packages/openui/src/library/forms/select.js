import { Select as UiSelect } from "@inglorious/ui/select"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { itemProps, rules, SIZES } from "./helpers.js"

export const SelectItem = defineComponent({
  name: "SelectItem",
  description: "One option of a Select",
  props: z.object({ value: z.string(), label: z.string() }),
  component: () => null,
})

export const Select = defineComponent({
  name: "Select",
  description: "A drop-down list to pick one option from",
  props: z.object({
    name: z.string(),
    items: z.array(SelectItem.ref),
    placeholder: z.string().optional(),
    rules,
    value: reactive(z.string().optional()),
    size: z.enum(["small", "medium", "large"]).optional(),
  }),
  component: ({ props, isStreaming, stateField, fieldError, label, hint }) => {
    const field = stateField(props.name, props.value)
    const options = itemProps(props.items)
    return UiSelect.render({
      name: props.name,
      label,
      hint,
      value: field.value ?? "",
      options: [
        { value: "", label: props.placeholder ?? "Choose…" },
        ...options,
      ],
      size: SIZES[props.size ?? "medium"],
      error: fieldError(props.name),
      isRequired: props.rules?.required,
      isDisabled: isStreaming,
      isFullWidth: true,
      onChange: field.setValue,
    })
  },
})
