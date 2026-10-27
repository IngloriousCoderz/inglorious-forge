import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Buttons } from "../actions/button.js"
import { CheckBoxGroup } from "./check-box-group.js"
import { Chips } from "./chips.js"
import { DatePicker } from "./date-picker.js"
import { Input, TextArea } from "./input.js"
import { OptionCards } from "./option-cards.js"
import { RadioGroup } from "./radio-group.js"
import { Select } from "./select.js"
import { Slider } from "./slider.js"
import { SwitchGroup } from "./switch-group.js"

export const Label = defineComponent({
  name: "Label",
  description: "A short text label, such as above a group of fields",
  props: z.object({ text: z.string() }),
  component: ({ props }) =>
    Typography.render({
      variant: "caption",
      weight: 600,
      children: props.text,
    }),
})

const fieldInputs = [
  Input,
  TextArea,
  Select,
  RadioGroup,
  CheckBoxGroup,
  SwitchGroup,
  Slider,
  DatePicker,
  Chips,
  OptionCards,
]

export const FormControl = defineComponent({
  name: "FormControl",
  description: "A form field with its label and an optional hint",
  props: z.object({
    label: z.string(),
    input: z.union(fieldInputs.map((input) => input.ref)),
    hint: z.string().optional(),
  }),
  // The field draws the label and hint, so they stay tied to it.
  component: ({ props, renderNode }) =>
    renderNode(props.input, { label: props.label, hint: props.hint }),
})

export const Form = defineComponent({
  name: "Form",
  description:
    "A form: its fields, then its buttons. A primary button checks the fields' rules before acting, and sends their values under the form's name.",
  props: z.object({
    name: z.string(),
    buttons: Buttons.ref,
    fields: z.array(FormControl.ref),
  }),
  component: ({ props, renderNode }) => {
    const controls = (props.fields ?? []).filter(Boolean)
    const scope = {
      formName: props.name,
      fields: controls.map((control) => control.props.input?.props ?? {}),
    }
    return Flex.render({
      direction: "column",
      gap: "md",
      children: [renderNode(controls, scope), renderNode(props.buttons, scope)],
    })
  },
})
