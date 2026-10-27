import { Card as UiCard } from "@inglorious/ui/card"
import { Flex } from "@inglorious/ui/flex"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Button } from "../actions/button.js"
import { Image } from "../content/image.js"
import { blockProps, renderBlock } from "./block.js"
import { IconText } from "./icon-text.js"
import { ImageText, ImageTextLarge } from "./image-text.js"
import { MetricIndicatorWithStrikethrough } from "./metric-indicator.js"
import { BoldText, Text } from "./text.js"

export const CompositeCardItem = defineComponent({
  name: "CompositeCardItem",
  description:
    "One rich card of a CompositeCardBlock: an optional header (IconText, ImageText, ImageTextLarge, Text or Image), a list of body parts (Text, BoldText, MetricIndicatorInline, IconText, Image, charts, ListBlock, TagBlock, EntityList), and an optional footer {price, button}",
  props: z.object({
    id: z.string().optional(),
    header: z
      .union([
        IconText.ref,
        ImageText.ref,
        ImageTextLarge.ref,
        Text.ref,
        Image.ref,
      ])
      .optional(),
    body: z.array(z.any()),
    footer: z
      .object({
        price: z
          .union([BoldText.ref, MetricIndicatorWithStrikethrough.ref])
          .optional(),
        button: Button.ref.optional(),
      })
      .optional(),
  }),
  component: () => null,
})

export const CompositeCardBlock = defineComponent({
  name: "CompositeCardBlock",
  description:
    'Rich cards, two a row, such as products or offers, each with a header, a body and a price and button: a grid, or a "carousel". With an action, every card is clickable.',
  props: blockProps(CompositeCardItem),
  component: (context) =>
    renderBlock(context, {
      renderItem: (item, renderNode) =>
        UiCard.render({
          children: Flex.render({
            direction: "column",
            gap: "md",
            children: [
              when(item.header, () => renderNode(item.header)),
              renderNode(item.body ?? []),
              when(item.footer, () =>
                Flex.render({
                  direction: "row",
                  align: "center",
                  justify: "between",
                  gap: "sm",
                  children: [
                    when(item.footer.price, () =>
                      renderNode(item.footer.price),
                    ),
                    when(item.footer.button, () =>
                      renderNode(item.footer.button),
                    ),
                  ],
                }),
              ),
            ],
          }),
        }),
      describe: (item) => ({
        itemTitle:
          item.header?.props?.title ??
          item.header?.props?.value ??
          item.header?.props?.alt,
      }),
    }),
})
