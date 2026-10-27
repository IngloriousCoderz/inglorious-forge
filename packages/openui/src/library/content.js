import { Alert } from "@inglorious/ui/alert"
import { Card as UiCard } from "@inglorious/ui/card"
import { Chip } from "@inglorious/ui/chip"
import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { html, nothing } from "@inglorious/web"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { flexProps, toFlex } from "./layout.js"

/** OpenUI's text sizes as Typography variants and weights. */
const TEXT_SIZES = {
  small: { variant: "caption" },
  default: { variant: "body" },
  large: { variant: "h3" },
  "small-heavy": { variant: "caption", weight: 600 },
  "large-heavy": { variant: "h2", weight: 700 },
}

export const Card = defineComponent({
  name: "Card",
  description:
    'Groups related content on a surface. variant "clear" drops the surface and keeps the layout.',
  // Laid out like Stack, with the variant last, so the two read alike.
  props: z.object({
    children: z.array(z.any()),
    ...flexProps,
    variant: z.enum(["card", "clear"]).optional(),
  }),
  component: ({ props, renderNode }) => {
    const content = Flex.render({
      ...toFlex(props),
      children: renderNode(props.children),
    })
    return props.variant === "clear"
      ? content
      : UiCard.render({ children: content })
  },
})

export const CardHeader = defineComponent({
  name: "CardHeader",
  description: "A title with an optional subtitle, heading a card or section",
  props: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }),
  component: ({ props }) =>
    html`${props.title ? Typography.render({ variant: "h3", children: props.title }) : nothing}
    ${
      props.subtitle
        ? Typography.render({
            variant: "caption",
            color: "secondary",
            children: props.subtitle,
          })
        : nothing
    }`,
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
    visible: z.boolean().optional(),
  }),
  component: ({ props }) =>
    props.visible === false
      ? nothing
      : Alert.render({
          severity: props.variant === "neutral" ? "info" : props.variant,
          variant: "outlined",
          title: props.title,
          description: props.description,
        }),
})

const TAG_COLORS = {
  neutral: "default",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "error",
}

export const Tag = defineComponent({
  name: "Tag",
  description: "A small label, such as a status",
  props: z.object({
    text: z.string(),
    size: z.enum(["sm", "md", "lg"]).optional(),
    variant: z
      .enum(["neutral", "info", "success", "warning", "danger"])
      .optional(),
  }),
  component: ({ props }) =>
    Chip.render({
      children: props.text,
      size: props.size ?? "sm",
      color: TAG_COLORS[props.variant ?? "neutral"],
    }),
})

export const Image = defineComponent({
  name: "Image",
  description: "An image with alt text and an optional URL",
  props: z.object({ alt: z.string(), src: z.string().optional() }),
  component: ({ props }) =>
    props.src
      ? html`<img
          src=${props.src}
          alt=${props.alt}
          loading="lazy"
          style="max-inline-size: 100%; block-size: auto;"
        />`
      : nothing,
})
