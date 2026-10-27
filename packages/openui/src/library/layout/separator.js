import { Divider } from "@inglorious/ui/divider"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const Separator = defineComponent({
  name: "Separator",
  description: "A line dividing content sections",
  props: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    decorative: z.boolean().optional(),
  }),
  component: ({ props }) =>
    Divider.render({
      orientation: props.orientation,
      isDecorative: props.decorative,
    }),
})
