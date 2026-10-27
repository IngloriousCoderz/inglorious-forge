import { Flex } from "@inglorious/ui/flex"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Tag } from "../content/tag.js"
import { blockProps, renderBlock, renderPhotoCard } from "./block.js"
import { BoldText } from "./text.js"

export const VisualCardItem = defineComponent({
  name: "VisualCardItem",
  description:
    "One photo card of a VisualCardBlock: a BoldText over a background image (bgImageSrc must be a real URL, bgImageAlt describes it), with an optional Tag on top",
  props: z.object({
    body: BoldText.ref,
    id: z.string().optional(),
    bgImageSrc: z.string().optional(),
    tag: Tag.ref.optional(),
    bgImageAlt: z.string().optional(),
  }),
  component: () => null,
})

export const VisualCardBlock = defineComponent({
  name: "VisualCardBlock",
  description:
    'Photo-first cards, such as places or products: a grid, or a "carousel". With an action, every card is clickable.',
  props: blockProps(VisualCardItem),
  component: (context) =>
    renderBlock(context, {
      renderItem: (item, renderNode) =>
        renderPhotoCard(
          item.bgImageSrc,
          item.bgImageAlt,
          Flex.render({
            direction: "column",
            justify: "between",
            gap: "md",
            children: [
              html`<div>${when(item.tag, () => renderNode(item.tag))}</div>`,
              html`<div
                style="padding: var(--iw-space-2) var(--iw-space-3); border-radius: var(--iw-radius-sm); background: color-mix(in srgb, var(--iw-color-bg) 85%, transparent);"
              >
                ${renderNode(item.body)}
              </div>`,
            ],
          }),
        ),
      describe: (item) => ({ itemTitle: item.body?.props?.value }),
    }),
})
