import { Icon as UiIcon } from "@inglorious/ui/icon"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const Icon = defineComponent({
  name: "Icon",
  description:
    "An icon by kebab-case name, such as 'circle-check' or 'rocket'. category, such as 'finance' or 'time', describes it when the name is unknown.",
  props: z.object({
    name: z.string(),
    category: z.string().optional(),
  }),
  component: ({ props, iconFor }) => {
    const icon = iconFor(props.name)
    return when(icon, () => UiIcon.render({ icon }))
  },
})
