import { Flex } from "@inglorious/ui/flex"
import { RadioGroup as UiRadioGroup } from "@inglorious/ui/radio-group"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { itemProps, renderError, rules } from "./helpers.js"

export const RadioItem = defineComponent({
  name: "RadioItem",
  description: "One option of a RadioGroup",
  props: z.object({
    label: z.string(),
    description: z.string().optional(),
    value: z.string(),
  }),
  component: () => null,
})

export const RadioGroup = defineComponent({
  name: "RadioGroup",
  description: "A few options shown at once, to pick one",
  props: z.object({
    name: z.string(),
    items: z.array(RadioItem.ref),
    rules,
    value: reactive(z.string().optional()),
  }),
  component: ({ props, isStreaming, stateField, fieldError, label }) => {
    const field = stateField(props.name, props.value)
    const error = fieldError(props.name)
    return Flex.render({
      direction: "column",
      gap: "sm",
      children: [
        UiRadioGroup.render({
          name: props.name,
          label,
          value: field.value ?? "",
          options: itemProps(props.items).map(
            ({ label, value, description }) => ({ label, value, description }),
          ),
          isDisabled: isStreaming,
          onChange: field.setValue,
        }),
        renderError(error),
      ],
    })
  },
})
