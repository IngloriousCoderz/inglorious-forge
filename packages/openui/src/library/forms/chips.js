import { Chip } from "@inglorious/ui/chip"
import { Flex } from "@inglorious/ui/flex"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Icon } from "../content/icon.js"
import {
  itemProps,
  renderError,
  renderLabel,
  rules,
  toggle,
  toSelection,
} from "./helpers.js"

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
