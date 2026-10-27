import { Chart } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { DEFAULT_HEIGHT, SINGLE_SERIES, toRows } from "./helpers.js"
import { Series } from "./series.js"

/** Room per category of a horizontal bar chart, and around them. */
const ROW_HEIGHT = 36

const ROWS_MARGIN = 80

/**
 * A fresh schema for each chart: `defineComponent` tags the schema with the
 * component's name, so two charts sharing one would answer to the same name.
 */
const cartesianProps = (variants) =>
  z.object({
    labels: z.array(z.string()),
    series: z.array(Series.ref),
    variant: z.enum(variants).optional(),
    xLabel: z.string().optional(),
    yLabel: z.string().optional(),
    height: z.number().optional(),
  })

const CURVES = ["linear", "natural", "step"]

export const BarChart = defineComponent({
  name: "BarChart",
  description:
    'Vertical bars, to compare values across labels with one or more series: BarChart(months, [Series("Sales", totals)]). variant "stacked" piles the series up.',
  props: cartesianProps(["grouped", "stacked"]),
  component: ({ props }) =>
    renderCartesian("bar", props, { isStacked: props.variant === "stacked" }),
})

export const LineChart = defineComponent({
  name: "LineChart",
  description:
    'Lines over labels, for trends over time. variant: "linear" (default), "natural" for smooth curves, "step".',
  props: cartesianProps(CURVES),
  component: ({ props }) =>
    renderCartesian("line", props, { curve: props.variant }),
})

export const AreaChart = defineComponent({
  name: "AreaChart",
  description:
    "Filled areas under lines, for cumulative totals or volumes over time. variant as LineChart's.",
  props: cartesianProps(CURVES),
  component: ({ props }) =>
    renderCartesian("area", props, { curve: props.variant }),
})

export const HorizontalBarChart = defineComponent({
  name: "HorizontalBarChart",
  description:
    'Horizontal bars, for long category names or a ranking: HorizontalBarChart(names, [Series("Votes", votes)]). variant "stacked" piles the series up.',
  props: z.object({
    labels: z.array(z.string()),
    series: z.array(Series.ref),
    variant: z.enum(["grouped", "stacked"]).optional(),
    xLabel: z.string().optional(),
    yLabel: z.string().optional(),
  }),
  // As tall as its categories need.
  component: ({ props }) =>
    renderCartesian("bar", props, {
      orientation: "horizontal",
      isStacked: props.variant === "stacked",
      height: (props.labels ?? []).length * ROW_HEIGHT + ROWS_MARGIN,
    }),
})

/** A bar, line or area chart from OpenUI's labels and series. */
function renderCartesian(
  type,
  { labels, series, xLabel, yLabel, height },
  options,
) {
  const lines = (series ?? []).filter(Boolean).map((item) => item.props)
  const data = toRows(labels, lines)

  return Chart.render({
    type,
    ariaLabel: [yLabel, xLabel].filter(Boolean).join(" by ") || `${type} chart`,
    data,
    dataKeys: lines.map((line) => line.category),
    xAxisLabel: xLabel,
    yAxisLabel: yLabel,
    hasTooltip: true,
    hasLegend: lines.length > SINGLE_SERIES,
    height: height ?? DEFAULT_HEIGHT,
    ...options,
  })
}
