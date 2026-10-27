import { Alert } from "@inglorious/ui/alert"
import { Card as UiCard } from "@inglorious/ui/card"
import { Chip } from "@inglorious/ui/chip"
import { Flex } from "@inglorious/ui/flex"
import { Icon as UiIcon } from "@inglorious/ui/icon"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../reactive.js"
import { flexProps, toFlex } from "./layout.js"

/** OpenUI's text sizes as Typography variants and weights. */
const TEXT_SIZES = {
  small: { variant: "caption" },
  default: { variant: "body" },
  large: { variant: "h3" },
  "small-heavy": { variant: "caption", weight: 600 },
  "large-heavy": { variant: "h2", weight: 700 },
}

/** OpenUI's card surfaces in Card's names. */
const CARD_VARIANTS = { card: "default", sunk: "sunk", clear: "clear" }

export const Card = defineComponent({
  name: "Card",
  description:
    'Groups related content on a surface: "card" (default) raised, "sunk" set into the page, "clear" with none. Lays its children out like Stack.',
  props: z.object({
    children: z.array(z.any()),
    variant: z.enum(["card", "sunk", "clear"]).optional(),
    ...flexProps,
  }),
  component: ({ props, renderNode }) =>
    UiCard.render({
      variant: CARD_VARIANTS[props.variant ?? "card"],
      children: Flex.render({
        ...toFlex(props),
        children: renderNode(props.children),
      }),
    }),
})

export const CardHeader = defineComponent({
  name: "CardHeader",
  description: "A title with an optional subtitle, heading a card or section",
  props: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }),
  component: ({ props }) =>
    html`${when(props.title, () => Typography.render({ variant: "h3", children: props.title }))}
    ${when(props.subtitle, () =>
      Typography.render({
        variant: "caption",
        color: "secondary",
        children: props.subtitle,
      }),
    )}`,
})

export const TextContent = defineComponent({
  name: "TextContent",
  description:
    'Text. size: "small", "default", "large", "small-heavy" or "large-heavy" (for a KPI figure).',
  props: z.object({
    text: z.string(),
    size: z
      .enum(["small", "default", "large", "small-heavy", "large-heavy"])
      .optional(),
  }),
  component: ({ props }) =>
    Typography.render({
      ...TEXT_SIZES[props.size ?? "default"],
      children: props.text,
    }),
})

export const Callout = defineComponent({
  name: "Callout",
  description:
    "A highlighted message. visible hides it when false, e.g. bound to a $variable an action sets.",
  props: z.object({
    variant: z.enum(["info", "warning", "error", "success", "neutral"]),
    title: z.string(),
    description: z.string(),
    visible: reactive(z.boolean().optional()),
  }),
  component: ({ props, stateField, statementId }) => {
    // Bound to a $variable, as in Callout(..., $saved), it shows while true.
    const visible = stateField(
      `${statementId ?? "callout"}:visible`,
      props.visible,
    )
    return when(visible.value !== false, () =>
      Alert.render({
        severity: props.variant,
        variant: "outlined",
        title: props.title,
        description: props.description,
      }),
    )
  },
})

const TAG_COLORS = {
  neutral: "default",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "error",
}

export const Icon = defineComponent({
  name: "Icon",
  description:
    "An icon by kebab-case name, such as 'circle-check' or 'rocket'. category, such as 'finance' or 'time', describes it when the name is unknown.",
  props: z.object({
    name: z.string(),
    category: z.string().optional(),
  }),
  // Drawn from the icons the app gives createOpenUI; an unknown one is left out.
  component: ({ props, iconFor }) => {
    const icon = iconFor(props.name)
    return when(icon, () => UiIcon.render({ icon }))
  },
})

export const Tag = defineComponent({
  name: "Tag",
  description: "A small label, such as a status, with an optional Icon",
  props: z.object({
    text: z.string(),
    icon: Icon.ref.optional(),
    size: z.enum(["sm", "md", "lg"]).optional(),
    variant: z
      .enum(["neutral", "info", "success", "warning", "danger"])
      .optional(),
  }),
  component: ({ props, renderNode }) =>
    Chip.render({
      children: props.text,
      icon: props.icon ? renderNode(props.icon) : undefined,
      size: props.size ?? "sm",
      color: TAG_COLORS[props.variant ?? "neutral"],
    }),
})

export const Image = defineComponent({
  name: "Image",
  description: "An image with alt text and an optional URL",
  props: z.object({ alt: z.string(), src: z.string().optional() }),
  component: ({ props }) =>
    when(
      props.src,
      () =>
        html`<img
          src=${props.src}
          alt=${props.alt}
          loading="lazy"
          style="max-inline-size: 100%; block-size: auto;"
        />`,
    ),
})
