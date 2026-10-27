import { Chip } from "@inglorious/ui/chip"
import { Flex } from "@inglorious/ui/flex"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Icon } from "./icon.js"

const TAG_COLORS = {
  neutral: "default",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "error",
}

export const Tag = defineComponent({
  name: "Tag",
  description: "A small label, such as a status, with an optional Icon",
  props: z.object({
    text: z.string(),
    icon: Icon.ref.optional(),
    size: z.enum(["sm", "md", "lg"]).optional(),
    variant: z
      .enum(["neutral", "info", "success", "warning", "danger"])
      .optional(),
  }),
  component: ({ props, renderNode }) =>
    Chip.render({
      children: props.text,
      icon: when(props.icon, () => renderNode(props.icon)),
      size: props.size ?? "sm",
      color: TAG_COLORS[props.variant ?? "neutral"],
    }),
})

export const TagBlock = defineComponent({
  name: "TagBlock",
  description: 'A row of tags: TagBlock(["Vegan", "Gluten free"], "sm")',
  props: z.object({
    tags: z.array(z.string()),
    size: z.enum(["sm", "md", "lg"]).optional(),
  }),
  component: ({ props }) =>
    Flex.render({
      direction: "row",
      gap: "xs",
      wrap: "wrap",
      children: (props.tags ?? []).map((tag) =>
        Chip.render({ children: tag, size: props.size ?? "sm" }),
      ),
    }),
})
