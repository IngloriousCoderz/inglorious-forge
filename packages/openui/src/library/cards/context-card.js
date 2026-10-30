import { Card as UiCard } from "@inglorious/ui/card"
import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { renderInlineMarkdown } from "../../markdown.js"
import { Tag } from "../content/tag.js"
import { blockProps, renderBlock, renderPhotoCard } from "./block.js"
import { SEMIBOLD } from "./helpers.js"

export const ContextCardItem = defineComponent({
  name: "ContextCardItem",
  description:
    'One card of a ContextCardBlock: a title (text or a Tag), a short body in markdown, and an optional "gray" tint or background image',
  props: z.object({
    id: z.string().optional(),
    title: z.union([z.string(), Tag.ref]),
    body: z.string().optional(),
    bgColor: z.enum(["gray"]).optional(),
    bgImageSrc: z.string().optional(),
    bgImageAlt: z.string().optional(),
  }),
  component: () => null,
})

export const ContextCardBlock = defineComponent({
  name: "ContextCardBlock",
  description:
    'Cards that sum something up in a title and a line or two, such as findings: a grid, or a "carousel". With an action, every card is clickable.',
  props: blockProps(ContextCardItem),
  component: (context) =>
    renderBlock(context, {
      renderItem: (item, renderNode) => {
        const content = Flex.render({
          direction: "column",
          align: "start",
          gap: "sm",
          children: [
            when(
              typeof item.title === "string",
              () =>
                Typography.render({ weight: SEMIBOLD, children: item.title }),
              () => renderNode(item.title),
            ),
            when(item.body, () =>
              Typography.render({
                weight: SEMIBOLD,
                children: renderInlineMarkdown(item.body),
              }),
            ),
          ],
        })
        return when(
          item.bgImageSrc,
          () => renderPhotoCard(item.bgImageSrc, item.bgImageAlt, content),
          () =>
            UiCard.render({
              variant: item.bgColor === "gray" ? "sunk" : "default",
              children: content,
            }),
        )
      },
      describe: (item) => ({
        itemTitle:
          typeof item.title === "string" ? item.title : item.title?.props?.text,
      }),
    }),
})
