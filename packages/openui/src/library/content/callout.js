import { Alert } from "@inglorious/ui/alert"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { renderInlineMarkdown } from "../../markdown.js"
import { reactive } from "../../reactive.js"

export const Callout = defineComponent({
  name: "Callout",
  description:
    'A highlighted message. visible is an optional $boolean: true shows it, and it clears itself after 3 seconds, for a "saved" message an action sets.',
  props: z.object({
    variant: z.enum(["info", "warning", "error", "success", "neutral"]),
    title: z.string(),
    description: z.string(),
    visible: reactive(z.boolean().optional()),
  }),
  component: ({ props, stateField, statementId }) => {
    const visible = stateField(
      `${statementId ?? "callout"}:visible`,
      props.visible,
    )
    return when(visible.value !== false, () =>
      Alert.render({
        severity: props.variant,
        variant: "outlined",
        title: props.title,
        description: renderInlineMarkdown(props.description),
      }),
    )
  },
})

/** OpenUI's callout tones in Alert's severities. */
const SEVERITIES = {
  neutral: "neutral",
  info: "info",
  warning: "warning",
  success: "success",
  danger: "error",
}

export const TextCallout = defineComponent({
  name: "TextCallout",
  description:
    "A note set apart from the text around it, always shown: a tip, a caveat, a warning.",
  props: z.object({
    variant: z
      .enum(["neutral", "info", "warning", "success", "danger"])
      .optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
  component: ({ props }) =>
    Alert.render({
      severity: SEVERITIES[props.variant ?? "neutral"],
      title: props.title,
      description: when(props.description, () =>
        renderInlineMarkdown(props.description),
      ),
    }),
})
