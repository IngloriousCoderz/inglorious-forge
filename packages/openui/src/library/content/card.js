import { Card as UiCard } from "@inglorious/ui/card"
import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { flexProps, toFlex } from "../layout/stack.js"

/** OpenUI's card surfaces in Card's names. */
export const CARD_VARIANTS = { card: "default", sunk: "sunk", clear: "clear" }

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
        color: "var(--iw-color-text-secondary)",
        children: props.subtitle,
      }),
    )}`,
})

export const InlineHeader = defineComponent({
  name: "InlineHeader",
  description:
    "A compact heading with an optional one-line description, labelling a block inside a card. Lighter than CardHeader.",
  props: z.object({
    heading: z.string(),
    description: z.string().optional(),
  }),
  component: ({ props }) =>
    Flex.render({
      direction: "column",
      gap: "xs",
      children: [
        Typography.render({ weight: 600, children: props.heading }),
        when(props.description, () =>
          Typography.render({
            variant: "caption",
            color: "var(--iw-color-text-secondary)",
            children: props.description,
          }),
        ),
      ],
    }),
})
