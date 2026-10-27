import { Bar, Chart, Legend, Tooltip } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

const DEFAULT_HEIGHT = 300
const MISSING_VALUE = 0
/** A legend is only worth its room when there is more than one series. */
const SINGLE_SERIES = 1
/** Room per category of a horizontal bar chart, and around them. */
const ROW_HEIGHT = 36
const ROWS_MARGIN = 80
/** A single stacked bar is one row with its legend above. */
const SINGLE_BAR_HEIGHT = 120
const SINGLE_BAR_PADDING = 8
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

export const SingleStackedBarChart = defineComponent({
  name: "SingleStackedBarChart",
  description:
    'One bar split into the parts of a whole, such as a budget: SingleStackedBarChart(["Rent", "Food"], [900, 400])',
  props: z.object({
    labels: z.array(z.string()),
    values: z.array(z.number()),
  }),
  component: ({ props }) => {
    const labels = props.labels ?? []
    return Chart.render({
      orientation: "horizontal",
      ariaLabel: "stacked bar",
      height: SINGLE_BAR_HEIGHT,
      padding: SINGLE_BAR_PADDING,
      data: [
        Object.fromEntries([
          ["label", ""],
          ...labels.map((label, index) => [
            label,
            props.values?.[index] ?? MISSING_VALUE,
          ]),
        ]),
      ],
      children: [
        ...labels.map((label) => Bar({ dataKey: label, stackId: "whole" })),
        Legend(),
        Tooltip(),
      ],
    })
  },
})

export const Point = defineComponent({
  name: "Point",
  description: "A point of a ScatterSeries: x, y, and an optional size z",
  props: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
  }),
  // Drawn by its chart.
  component: () => null,
})

export const ScatterSeries = defineComponent({
  name: "ScatterSeries",
  description: "A named set of Points in a ScatterChart",
  props: z.object({
    name: z.string(),
    points: z.array(Point.ref),
  }),
  component: () => null,
})

export const ScatterChart = defineComponent({
  name: "ScatterChart",
  description:
    'Points by two numbers, for correlations and clusters: ScatterChart([ScatterSeries("Cars", [Point(1200, 15), Point(1800, 11)])], "Weight", "km/l"). A Point\'s z sizes it.',
  props: z.object({
    datasets: z.array(ScatterSeries.ref),
    xLabel: z.string().optional(),
    yLabel: z.string().optional(),
  }),
  component: ({ props }) => {
    const datasets = (props.datasets ?? []).filter(Boolean).map(unwrap)
    return Chart.render({
      type: "scatter",
      ariaLabel:
        [props.yLabel, props.xLabel].filter(Boolean).join(" by ") ||
        "scatter chart",
      data: datasets.map((dataset) => ({
        name: dataset.name,
        points: (dataset.points ?? []).map(unwrap),
      })),
      xAxisLabel: props.xLabel,
      yAxisLabel: props.yLabel,
      hasTooltip: true,
      hasLegend: datasets.length > SINGLE_SERIES,
      height: DEFAULT_HEIGHT,
    })
  },
})

export const RadarChart = defineComponent({
  name: "RadarChart",
  description:
    'A web of values around a circle, to compare several measures of one or more things: RadarChart(["Speed", "Power", "Range"], [Series("Model A", [8, 5, 7])])',
  props: z.object({
    labels: z.array(z.string()),
    series: z.array(Series.ref),
  }),
  component: ({ props }) => {
    const lines = (props.series ?? []).filter(Boolean).map((item) => item.props)
    return Chart.render({
      type: "radar",
      ariaLabel: "radar chart",
      data: toRows(props.labels, lines),
      dataKeys: lines.map((line) => line.category),
      hasTooltip: true,
      hasLegend: lines.length > SINGLE_SERIES,
      height: DEFAULT_HEIGHT,
    })
  },
})

export const RadialChart = defineComponent({
  name: "RadialChart",
  description:
    'A ring per value, filled in proportion to the largest, such as goals reached: RadialChart(["Move", "Exercise"], [80, 45])',
  props: z.object({
    labels: z.array(z.string()),
    values: z.array(z.number()),
  }),
  component: ({ props }) =>
    Chart.render({
      type: "radial",
      ariaLabel: "radial chart",
      data: (props.labels ?? []).map((label, index) => ({
        label,
        value: props.values?.[index] ?? MISSING_VALUE,
      })),
      hasTooltip: true,
      hasLegend: true,
      height: DEFAULT_HEIGHT,
    }),
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

/**
 * One row per label with a field per series, the shape the chart engine
 * reads: OpenUI's charts come column by column, like its tables.
 */
function toRows(labels, lines) {
  return (labels ?? []).map((label, index) => ({
    label,
    ...Object.fromEntries(
      lines.map((line) => [
        line.category,
        line.values?.[index] ?? MISSING_VALUE,
      ]),
    ),
  }))
}

/** A dataset or point, written as a component or as a plain object. */
function unwrap(value) {
  return value?.type === "element" ? value.props : value
}

/**
 * The charts, to add to a library:
 * `uiLibrary.extend({ components: { add: chartComponents } })`.
 * They need `@inglorious/charts` and its stylesheets in the app.
 */
export const chartComponents = [
  BarChart,
  HorizontalBarChart,
  LineChart,
  AreaChart,
  RadarChart,
  Series,
  PieChart,
  RadialChart,
  SingleStackedBarChart,
  ScatterChart,
  ScatterSeries,
  Point,
]
