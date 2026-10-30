import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const Series = defineComponent({
  name: "Series",
  description: "One data series: its name, and one value per label",
  props: z.object({
    category: z.string(),
    values: z.array(z.number()),
  }),
  component: () => null,
})
