import { Flex } from "@inglorious/ui/flex"
import { html } from "@inglorious/web"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { renderMediaText, renderTitles } from "./helpers.js"

const IMAGE_SIZE = 40

export const ImageText = defineComponent({
  name: "ImageText",
  description:
    "A small square image, such as a thumbnail or avatar, with a title and optional subtitle. src must be a real image URL.",
  props: z.object({
    src: z.string(),
    alt: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    bold: z.boolean().optional(),
    layout: z.enum(["horizontal", "vertical"]).optional(),
    imageSize: z.number().optional(),
  }),
  component: ({ props }) => {
    const side = props.imageSize ?? IMAGE_SIZE
    return renderMediaText(
      props,
      html`<img
        src=${props.src}
        alt=${props.alt ?? ""}
        loading="lazy"
        style="flex: none; inline-size: ${side}px; block-size: ${side}px; object-fit: cover; border-radius: var(--iw-radius-sm);"
      />`,
    )
  },
})

export const ImageTextLarge = defineComponent({
  name: "ImageTextLarge",
  description:
    "A banner image as wide as its card, above a title and optional subtitle. src must be a real image URL.",
  props: z.object({
    src: z.string(),
    alt: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    bold: z.boolean().optional(),
  }),
  component: ({ props }) =>
    Flex.render({
      direction: "column",
      gap: "sm",
      children: [
        html`<img
          src=${props.src}
          alt=${props.alt ?? ""}
          loading="lazy"
          style="display: block; inline-size: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: var(--iw-radius-md);"
        />`,
        renderTitles(props),
      ],
    }),
})
