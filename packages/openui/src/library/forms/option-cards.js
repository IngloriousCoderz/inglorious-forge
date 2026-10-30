import { Checkbox } from "@inglorious/ui/checkbox"
import { Flex } from "@inglorious/ui/flex"
import { Grid } from "@inglorious/ui/grid"
import { RadioGroup as UiRadioGroup } from "@inglorious/ui/radio-group"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Icon } from "../content/icon.js"
import { Image } from "../content/image.js"
import {
  itemProps,
  renderError,
  renderLabel,
  rules,
  toggle,
  toSelection,
} from "./helpers.js"

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
