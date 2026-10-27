import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { BOLD, NUMBERS, SECONDARY, TEXT_SIZES } from "./helpers.js"

// ── Building blocks ──

const textProps = () =>
  z.object({
    variant: z.enum(["text", "number"]).optional(),
    value: z.string(),
    subtext: z.string().optional(),
    subtextVariant: z.enum(["text", "number", "metric"]).optional(),
    size: z.enum(["xs", "sm", "md", "lg"]).optional(),
  })

export const Text = defineComponent({
  name: "Text",
  description:
    'A line of text in a card item, with an optional subtext. variant "number" lines figures up; subtextVariant "metric" colours a leading + or - green or red.',
  props: textProps(),
  component: ({ props }) => renderTextLine(props),
})

export const BoldText = defineComponent({
  name: "BoldText",
  description: "Text as Text, in bold: a value or a name to stand out",
  props: textProps(),
  component: ({ props }) => renderTextLine(props, BOLD),
})

function renderTextLine(props, weight) {
  const isNumber = props.variant === "number"
  return Flex.render({
    direction: "column",
    gap: "none",
    children: [
      Typography.render({
        variant: TEXT_SIZES[props.size ?? "sm"],
        weight,
        children: when(
          isNumber,
          () => html`<span style=${NUMBERS}>${props.value}</span>`,
          () => props.value,
        ),
      }),
      when(props.subtext, () =>
        Typography.render({
          variant: "caption",
          color: subtextColor(props),
          children: when(
            props.subtextVariant === "number" ||
              props.subtextVariant === "metric",
            () => html`<span style=${NUMBERS}>${props.subtext}</span>`,
            () => props.subtext,
          ),
        }),
      ),
    ],
  })
}

/** A metric subtext's sign gives its colour: + is good news, - bad. */
function subtextColor({ subtext, subtextVariant }) {
  if (subtextVariant !== "metric") return SECONDARY
  if (subtext.trim().startsWith("+")) return "var(--iw-color-success)"
  if (/^[-−]/.test(subtext.trim())) return "var(--iw-color-error)"
  return SECONDARY
}
