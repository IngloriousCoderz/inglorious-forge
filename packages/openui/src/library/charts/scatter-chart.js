import { Chart } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { DEFAULT_HEIGHT, SINGLE_SERIES, unwrap } from "./helpers.js"

export const Point = defineComponent({
  name: "Point",
  description: "A point of a ScatterSeries: x, y, and an optional size z",
  props: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
  }),
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
