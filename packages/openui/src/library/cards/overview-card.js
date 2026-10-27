import { Card as UiCard } from "@inglorious/ui/card"
import { Flex } from "@inglorious/ui/flex"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { blockProps, renderBlock } from "./block.js"
import { IconText } from "./icon-text.js"
import { ImageText } from "./image-text.js"
import { MetricIndicatorInline } from "./metric-indicator.js"
import { Text } from "./text.js"

export const OverviewCardItem = defineComponent({
  name: "OverviewCardItem",
  description:
    "One card of an OverviewCardBlock: a heading on top (IconText, ImageText or Text) and an optional MetricIndicatorInline below",
  props: z.object({
    id: z.string().optional(),
    top: z.union([IconText.ref, ImageText.ref, Text.ref]),
    bottom: MetricIndicatorInline.ref.optional(),
  }),
  component: () => null,
})

export const OverviewCardBlock = defineComponent({
  name: "OverviewCardBlock",
  description:
    'Compact cards of a heading over a figure, for KPIs: a grid, or a "carousel" to scroll. With an action, every card is clickable.',
  props: blockProps(OverviewCardItem),
  component: (context) =>
    renderBlock(context, {
      renderItem: (item, renderNode) =>
        UiCard.render({
          children: Flex.render({
            direction: "column",
            gap: "md",
            children: [
              renderNode(item.top),
              when(item.bottom, () => renderNode(item.bottom)),
            ],
          }),
        }),
      describe: (item) => ({
        itemTitle: item.top?.props?.title ?? item.top?.props?.value,
        itemValue: item.bottom?.props?.value,
      }),
    }),
})
