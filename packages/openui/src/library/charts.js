import { Chart } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

const DEFAULT_HEIGHT = 300
const MISSING_VALUE = 0
/** A legend is only worth its room when there is more than one series. */
const SINGLE_SERIES = 1
/** A half pie: the top half, from nine o'clock to three. */
const HALF_PIE = {
  startAngle: -90,
  endAngle: 90,
  cy: "75%",
  outerRadius: "90%",
}

export const Series = defineComponent({
  name: "Series",
  description: "One data series: its name, and one value per label",
  props: z.object({
    category: z.string(),
    values: z.array(z.number()),
  }),
  // Drawn by its chart.
  component: () => null,
})

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

export const PieChart = defineComponent({
  name: "PieChart",
  description:
    'Slices of a whole: PieChart(["Rent", "Food"], [900, 400]). variant "donut" leaves a hole in the middle; appearance "semiCircular" draws a half circle.',
  props: z.object({
    labels: z.array(z.string()),
    values: z.array(z.number()),
    variant: z.enum(["pie", "donut"]).optional(),
    appearance: z.enum(["circular", "semiCircular"]).optional(),
  }),
  component: ({ props }) =>
    Chart.render({
      type: props.variant === "donut" ? "donut" : "pie",
      ariaLabel: "pie chart",
      data: (props.labels ?? []).map((label, index) => ({
        label,
        value: props.values?.[index] ?? MISSING_VALUE,
      })),
      hasTooltip: true,
      hasLegend: true,
      height: DEFAULT_HEIGHT,
      ...(props.appearance === "semiCircular" && HALF_PIE),
    }),
})

/**
 * One row per label with a field per series, the shape the chart engine
 * reads: OpenUI's charts come column by column, like its tables.
 */
function renderCartesian(
  type,
  { labels, series, xLabel, yLabel, height },
  options,
) {
  const lines = (series ?? []).filter(Boolean).map((item) => item.props)
  const data = (labels ?? []).map((label, index) => ({
    label,
    ...Object.fromEntries(
      lines.map((line) => [
        line.category,
        line.values?.[index] ?? MISSING_VALUE,
      ]),
    ),
  }))

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

/**
 * The charts, to add to a library:
 * `uiLibrary.extend({ components: { add: chartComponents } })`.
 * They need `@inglorious/charts` and its stylesheets in the app.
 */
export const chartComponents = [
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  Series,
]
