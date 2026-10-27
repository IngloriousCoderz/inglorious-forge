import { Chart } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { DEFAULT_HEIGHT, MISSING_VALUE } from "./helpers.js"

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
