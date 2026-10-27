import { Card as UiCard } from "@inglorious/ui/card"
import { Checkbox } from "@inglorious/ui/checkbox"
import { Chip } from "@inglorious/ui/chip"
import { Flex } from "@inglorious/ui/flex"
import { Grid } from "@inglorious/ui/grid"
import { Input as UiInput } from "@inglorious/ui/input"
import { RadioGroup as UiRadioGroup } from "@inglorious/ui/radio-group"
import { Select as UiSelect } from "@inglorious/ui/select"
import { Slider as UiSlider } from "@inglorious/ui/slider"
import { Switch } from "@inglorious/ui/switch"
import { Textarea } from "@inglorious/ui/textarea"
import { Typography } from "@inglorious/ui/typography"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../reactive.js"
import { Buttons } from "./actions.js"
import { Icon, Image } from "./content.js"

/** OpenUI's field sizes in Inglorious UI's names. */
const SIZES = { small: "sm", medium: "md", large: "lg" }

/** What a field must hold for its form to go ahead, as OpenUI spells it. */
const rules = z
  .object({
    required: z.boolean().optional(),
    email: z.boolean().optional(),
    url: z.boolean().optional(),
    numeric: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
  })
  .optional()

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

export const SelectItem = defineComponent({
  name: "SelectItem",
  description: "One option of a Select",
  props: z.object({ value: z.string(), label: z.string() }),
  // Rendered by its Select.
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
      // Nothing is picked until the user picks: the first option is a prompt.
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

export const CheckBoxItem = defineComponent({
  name: "CheckBoxItem",
  description: "One box of a CheckBoxGroup, kept under its own name",
  props: z.object({
    label: z.string(),
    description: z.string().optional(),
    name: z.string(),
    defaultChecked: z.boolean().optional(),
  }),
  component: () => null,
})

export const CheckBoxGroup = defineComponent({
  name: "CheckBoxGroup",
  description:
    "Boxes to tick any number of. Its value is an object of each box's name and whether it is ticked.",
  props: z.object({
    name: z.string(),
    items: z.array(CheckBoxItem.ref),
    rules,
    value: reactive(z.record(z.string(), z.boolean()).optional()),
  }),
  component: (context) => renderToggles(context, Checkbox),
})

export const SwitchItem = defineComponent({
  name: "SwitchItem",
  description: "One switch of a SwitchGroup, kept under its own name",
  props: z.object({
    label: z.string().optional(),
    description: z.string().optional(),
    name: z.string(),
    defaultChecked: z.boolean().optional(),
  }),
  component: () => null,
})

export const SwitchGroup = defineComponent({
  name: "SwitchGroup",
  description:
    "Switches for settings that are on or off. Its value is an object of each switch's name and whether it is on.",
  props: z.object({
    name: z.string(),
    items: z.array(SwitchItem.ref),
    variant: z.enum(["clear", "card", "sunk"]).optional(),
    value: reactive(z.record(z.string(), z.boolean()).optional()),
  }),
  // "card" and "sunk" set the switches on a surface of their own.
  component: (context) => {
    const toggles = renderToggles(context, Switch)
    const variant = context.props.variant ?? "clear"
    return when(
      variant === "clear",
      () => toggles,
      () =>
        UiCard.render({
          variant: variant === "card" ? "default" : "sunk",
          children: toggles,
        }),
    )
  },
})

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

export const ChipItem = defineComponent({
  name: "ChipItem",
  description: "One option of Chips: its value, label and optional Icon",
  props: z.object({
    value: z.string(),
    label: z.string(),
    icon: Icon.ref.optional(),
    disabled: z.boolean().optional(),
  }),
  // Rendered by its Chips.
  component: () => null,
})

export const Chips = defineComponent({
  name: "Chips",
  description:
    'Compact pills to pick short options with: type "multiple" (default) keeps a list of values, "single" one value.',
  props: z.object({
    name: z.string(),
    type: z.enum(["single", "multiple"]).optional(),
    items: z.array(ChipItem.ref),
    rules,
    defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  component: ({
    props,
    isStreaming,
    stateField,
    fieldError,
    label,
    renderNode,
  }) => {
    const type = props.type ?? "multiple"
    const field = stateField(props.name)
    const selected = toSelection(field.value ?? props.defaultValue)

    return Flex.render({
      direction: "column",
      gap: "xs",
      children: [
        renderLabel(label),
        Flex.render({
          direction: "row",
          gap: "xs",
          wrap: "wrap",
          children: itemProps(props.items)
            .filter((item) => item.value)
            .map((item) =>
              Chip.render({
                children: item.label,
                icon: when(item.icon, () => renderNode(item.icon)),
                isSelected: selected.includes(item.value),
                isDisabled: isStreaming || item.disabled,
                onClick: () =>
                  field.setValue(toggle(type, selected, item.value)),
              }),
            ),
        }),
        renderError(fieldError(props.name)),
      ],
    })
  },
})

export const OptionCard = defineComponent({
  name: "OptionCard",
  description:
    "One option of OptionCards: its value, title, optional subtitle, and an optional Icon or Image on top",
  props: z.object({
    value: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    topContent: z.union([Icon.ref, Image.ref]).optional(),
    disabled: z.boolean().optional(),
  }),
  // Rendered by its OptionCards.
  component: () => null,
})

export const OptionCards = defineComponent({
  name: "OptionCards",
  description:
    'Options as cards in a grid, for choices worth a picture or a line of detail: type "single" (default) keeps one value, "multiple" a list.',
  props: z.object({
    name: z.string(),
    type: z.enum(["single", "multiple"]).optional(),
    items: z.array(OptionCard.ref),
    rules,
    defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  component: ({
    props,
    isStreaming,
    stateField,
    fieldError,
    label,
    renderNode,
  }) => {
    const field = stateField(props.name)
    const items = itemProps(props.items).filter((item) => item.value)
    const media = (item) =>
      when(item.topContent, () => renderNode(item.topContent))
    const error = renderError(fieldError(props.name))

    if (props.type !== "multiple") {
      return Flex.render({
        direction: "column",
        gap: "xs",
        children: [
          UiRadioGroup.render({
            name: props.name,
            label,
            variant: "card",
            value: field.value ?? props.defaultValue ?? "",
            options: items.map((item) => ({
              label: item.title,
              description: item.subtitle,
              value: item.value,
              media: media(item),
              isDisabled: item.disabled,
            })),
            isDisabled: isStreaming,
            onChange: field.setValue,
          }),
          error,
        ],
      })
    }

    const selected = toSelection(field.value ?? props.defaultValue)
    return Flex.render({
      direction: "column",
      gap: "xs",
      children: [
        renderLabel(label),
        Grid.render({
          minColumnWidth: "12rem",
          gap: "sm",
          children: items.map((item) =>
            Checkbox.render({
              name: `${props.name}-${item.value}`,
              label: item.title,
              description: item.subtitle,
              media: media(item),
              variant: "card",
              isChecked: selected.includes(item.value),
              isDisabled: isStreaming || item.disabled,
              onChange: () =>
                field.setValue(toggle("multiple", selected, item.value)),
            }),
          ),
        }),
        error,
      ],
    })
  },
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

/** The props of each item of a list, skipping the ones not arrived yet. */
function itemProps(items) {
  return (items ?? []).filter(Boolean).map((item) => item.props)
}

/** What is picked, as a list, whether one value or several are kept. */
function toSelection(value) {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

/** The value after pressing an option: one value, or a list of them. */
function toggle(type, selected, value) {
  const isPicked = selected.includes(value)
  if (type === "single") return isPicked ? "" : value
  return isPicked
    ? selected.filter((item) => item !== value)
    : [...selected, value]
}

function renderLabel(label) {
  return when(label, () =>
    Typography.render({ variant: "caption", children: label }),
  )
}

function renderError(error) {
  return when(error, () =>
    Typography.render({ variant: "caption", color: "error", children: error }),
  )
}

/** A group of named on/off controls whose value is an object of them. */
function renderToggles(
  { props, isStreaming, stateField, fieldError, label },
  Control,
) {
  const field = stateField(props.name, props.value)
  const value = field.value ?? {}
  const items = itemProps(props.items)

  return Flex.render({
    direction: "column",
    gap: "sm",
    children: [
      renderLabel(label),
      ...items.map((item) =>
        Control.render({
          name: item.name,
          label: item.label,
          description: item.description || undefined,
          isChecked: value[item.name] ?? item.defaultChecked ?? false,
          isDisabled: isStreaming,
          onChange: (isChecked) =>
            field.setValue({ ...value, [item.name]: isChecked }),
        }),
      ),
      renderError(fieldError(props.name)),
    ],
  })
}
