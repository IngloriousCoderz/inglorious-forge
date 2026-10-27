import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { when } from "@inglorious/web/directives/when"
import { z } from "zod"

/** OpenUI's field sizes in Inglorious UI's names. */
export const SIZES = { small: "sm", medium: "md", large: "lg" }

/** What a field must hold for its form to go ahead, as OpenUI spells it. */
export const rules = z
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

/** The props of each item of a list, skipping the ones not arrived yet. */
export function itemProps(items) {
  return (items ?? []).filter(Boolean).map((item) => item.props)
}

/** What is picked, as a list, whether one value or several are kept. */
export function toSelection(value) {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

/** The value after pressing an option: one value, or a list of them. */
export function toggle(type, selected, value) {
  const isPicked = selected.includes(value)
  if (type === "single") return isPicked ? "" : value
  return isPicked
    ? selected.filter((item) => item !== value)
    : [...selected, value]
}

export function renderLabel(label) {
  return when(label, () =>
    Typography.render({ variant: "caption", children: label }),
  )
}

export function renderError(error) {
  return when(error, () =>
    Typography.render({
      variant: "caption",
      color: "var(--iw-color-error)",
      children: error,
    }),
  )
}

/** A group of named on/off controls whose value is an object of them. */
export function renderToggles(
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
