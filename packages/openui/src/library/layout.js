import { Divider } from "@inglorious/ui/divider"
import { Flex } from "@inglorious/ui/flex"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** OpenUI's gap scale, folded onto Flex's shorter one. */
const GAPS = {
  none: "none",
  xs: "sm",
  s: "sm",
  m: "md",
  l: "lg",
  xl: "xl",
  "2xl": "xl",
}

export const flexProps = {
  direction: z.enum(["row", "column"]).optional(),
  gap: z.enum(["none", "xs", "s", "m", "l", "xl", "2xl"]).optional(),
  align: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
  justify: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional(),
  wrap: z.boolean().optional(),
}

/** Flex props from the OpenUI ones, with a column and a medium gap by default. */
export function toFlex({ direction, gap, align, justify, wrap }) {
  return {
    direction: direction ?? "column",
    gap: GAPS[gap ?? "m"],
    align,
    justify,
    wrap: wrap ? "wrap" : "nowrap",
  }
}

export const Stack = defineComponent({
  name: "Stack",
  description:
    'Lays its children out in a column (default) or a row. For a grid, use direction "row" with wrap true.',
  props: z.object({ children: z.array(z.any()), ...flexProps }),
  component: ({ props, renderNode }) =>
    Flex.render({ ...toFlex(props), children: renderNode(props.children) }),
})

export const Separator = defineComponent({
  name: "Separator",
  description: "A line dividing content sections",
  props: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
  }),
  component: ({ props }) => Divider.render({ orientation: props.orientation }),
})
