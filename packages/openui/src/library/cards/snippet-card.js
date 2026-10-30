import { Card as UiCard } from "@inglorious/ui/card"
import { Flex } from "@inglorious/ui/flex"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { blockProps, renderBlock } from "./block.js"
import { IconText } from "./icon-text.js"
import { ImageText } from "./image-text.js"
import { BoldText, Text } from "./text.js"

export const SnippetCardItem = defineComponent({
  name: "SnippetCardItem",
  description:
    "One small card of a SnippetCardBlock: a label on the left (IconText or ImageText) and an optional value on the right (Text or BoldText)",
  props: z.object({
    id: z.string().optional(),
    lhs: z.union([IconText.ref, ImageText.ref]),
    rhs: z.union([Text.ref, BoldText.ref]).optional(),
  }),
  component: () => null,
})

export const SnippetCardBlock = defineComponent({
  name: "SnippetCardBlock",
  description:
    "Small label and value cards, two a row, for a few short facts side by side. With an action, every card is clickable.",
  props: blockProps(SnippetCardItem, ["grid"]),
  component: (context) =>
    renderBlock(context, {
      renderItem: (item, renderNode) =>
        UiCard.render({
          children: Flex.render({
            direction: "row",
            align: "center",
            justify: "between",
            gap: "sm",
            children: [
              renderNode(item.lhs),
              when(item.rhs, () =>
                renderNode({
                  ...item.rhs,
                  props: { ...item.rhs.props, size: "xs" },
                }),
              ),
            ],
          }),
        }),
      describe: (item) => ({
        itemTitle: item.lhs?.props?.title,
        itemSubtitle: item.lhs?.props?.subtitle,
        itemValue: item.rhs?.props?.value,
      }),
    }),
})
