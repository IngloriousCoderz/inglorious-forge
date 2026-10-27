import { Slider as UiSlider } from "@inglorious/ui/slider"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { rules } from "./helpers.js"

export const Slider = defineComponent({
  name: "Slider",
  description:
    'A number, or with two values a range, picked by dragging between min and max. variant "discrete" marks every step. Its value is a list: [50], or [20, 80] for a range.',
  props: z.object({
    name: z.string(),
    variant: z.enum(["continuous", "discrete"]),
    min: z.number(),
    max: z.number(),
    step: z.number().optional(),
    defaultValue: z.array(z.number()).optional(),
    label: z.string().optional(),
    rules,
    value: reactive(z.array(z.number()).optional()),
  }),
  component: ({ props, isStreaming, stateField, label }) => {
    const field = stateField(props.name, props.value)
    // OpenUI keeps a slider's value as a list: one number, or a range's two.
    const [low, high] = field.value ?? props.defaultValue ?? [props.min]
    const isRange = high !== undefined
    return UiSlider.render({
      name: props.name,
      label: props.label ?? label,
      min: props.min,
      max: props.max,
      step: props.step,
      value: isRange ? [low, high] : low,
      hasMarks: props.variant === "discrete",
      isValueVisible: true,
      isFullWidth: true,
      isDisabled: isStreaming,
      onChange: (value) =>
        field.setValue(Array.isArray(value) ? value : [value]),
    })
  },
})
