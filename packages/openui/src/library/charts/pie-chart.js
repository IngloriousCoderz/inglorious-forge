import { Chart } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { DEFAULT_HEIGHT, MISSING_VALUE } from "./helpers.js"

/** A half pie: the top half, from nine o'clock to three. */
const HALF_PIE = {
  startAngle: -90,
  endAngle: 90,
  cy: "75%",
  outerRadius: "90%",
}

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
