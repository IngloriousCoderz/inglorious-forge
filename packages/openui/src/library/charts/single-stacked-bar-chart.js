import { Bar, Chart, Legend, Tooltip } from "@inglorious/charts"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { MISSING_VALUE } from "./helpers.js"

/** A single stacked bar is one row with its legend above. */
const SINGLE_BAR_HEIGHT = 120

const SINGLE_BAR_PADDING = 8

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
