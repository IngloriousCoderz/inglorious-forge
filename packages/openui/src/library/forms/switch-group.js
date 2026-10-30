import { Card as UiCard } from "@inglorious/ui/card"
import { Switch } from "@inglorious/ui/switch"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"
import { renderToggles } from "./helpers.js"

export const SwitchItem = defineComponent({
  name: "SwitchItem",
  description: "One switch of a SwitchGroup, kept under its own name",
  props: z.object({
    label: z.string().optional(),
    description: z.string().optional(),
    name: z.string(),
    defaultChecked: z.boolean().optional(),
  }),
  component: () => null,
})

export const SwitchGroup = defineComponent({
  name: "SwitchGroup",
  description:
    "Switches for settings that are on or off. Its value is an object of each switch's name and whether it is on.",
  props: z.object({
    name: z.string(),
    items: z.array(SwitchItem.ref),
    variant: z.enum(["clear", "card", "sunk"]).optional(),
    value: reactive(z.record(z.string(), z.boolean()).optional()),
  }),
  component: (context) => {
    const toggles = renderToggles(context, Switch)
    const variant = context.props.variant ?? "clear"
    return when(
      variant === "clear",
      () => toggles,
      () =>
        UiCard.render({
          variant: variant === "card" ? "default" : "sunk",
          children: toggles,
        }),
    )
  },
})
