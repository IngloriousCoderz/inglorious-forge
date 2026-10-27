import { Checkbox } from "@inglorious/ui/checkbox"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { renderToggles, rules } from "./helpers.js"

export const CheckBoxItem = defineComponent({
  name: "CheckBoxItem",
  description: "One box of a CheckBoxGroup, kept under its own name",
  props: z.object({
    label: z.string(),
    description: z.string().optional(),
    name: z.string(),
    defaultChecked: z.boolean().optional(),
  }),
  component: () => null,
})

export const CheckBoxGroup = defineComponent({
  name: "CheckBoxGroup",
  description:
    "Boxes to tick any number of. Its value is an object of each box's name and whether it is ticked.",
  props: z.object({
    name: z.string(),
    items: z.array(CheckBoxItem.ref),
    rules,
    value: reactive(z.record(z.string(), z.boolean()).optional()),
  }),
  component: (context) => renderToggles(context, Checkbox),
})
