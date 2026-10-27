import { Chart } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { DEFAULT_HEIGHT, SINGLE_SERIES, toRows } from "./helpers.js"
import { Series } from "./series.js"

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
