import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { BOLD, NUMBERS, SECONDARY, SEMIBOLD } from "./helpers.js"

const trend = z
  .object({ direction: z.enum(["up", "down"]), value: z.number() })
  .optional()

export const MetricIndicatorInline = defineComponent({
  name: "MetricIndicatorInline",
  description:
    'A headline figure, with an optional trend and subtext, on one line: MetricIndicatorInline("€12,400", "this month", {direction: "up", value: 8})',
  props: z.object({
    value: z.string(),
    subtext: z.string().optional(),
    trend,
  }),
  component: ({ props }) => renderMetric(props),
})

export const MetricIndicatorWithStrikethrough = defineComponent({
  name: "MetricIndicatorWithStrikethrough",
  description:
    'A figure that replaced another, the old one struck through, such as a discounted price: MetricIndicatorWithStrikethrough("€79", "per year", "€99")',
  props: z.object({
    value: z.string(),
    subtext: z.string().optional(),
    previousValue: z.string().optional(),
    trend,
  }),
  component: ({ props }) => renderMetric(props),
})

function renderMetric({ value, subtext, previousValue, trend }) {
  const trendColor =
    trend?.direction === "down"
      ? "var(--iw-color-error)"
      : "var(--iw-color-success)"
  return Flex.render({
    direction: "row",
    align: "baseline",
    gap: "sm",
    wrap: "wrap",
    children: [
      Typography.render({
        variant: "h3",
        weight: BOLD,
        children: html`<span style=${NUMBERS}>${value}</span>`,
      }),
      when(previousValue, () =>
        Typography.render({
          variant: "caption",
          color: SECONDARY,
          children: html`<s>${previousValue}</s>`,
        }),
      ),
      when(trend, () =>
        Typography.render({
          variant: "caption",
          weight: SEMIBOLD,
          color: trendColor,
          children: `${trend.direction === "down" ? "▼" : "▲"} ${Math.abs(trend.value)}%`,
        }),
      ),
      when(subtext, () =>
        Typography.render({
          variant: "caption",
          color: SECONDARY,
          children: subtext,
        }),
      ),
    ],
  })
}
