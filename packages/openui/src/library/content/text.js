import { Card as UiCard } from "@inglorious/ui/card"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { renderInlineMarkdown, renderMarkdown } from "../../markdown.js"
import { CARD_VARIANTS } from "./card.js"

/** OpenUI's text sizes as Typography variants and weights. */
const TEXT_SIZES = {
  small: { variant: "caption" },
  default: { variant: "body" },
  large: { variant: "h3" },
  "small-heavy": { variant: "caption", weight: 600 },
  "large-heavy": { variant: "h2", weight: 700 },
}

/** Citations count their sources from one. */
const FIRST_SOURCE = 1

/** Only web links: a model-written `javascript:` URL must not run. */
const WEB_URL = /^https?:\/\//i

export const TextContent = defineComponent({
  name: "TextContent",
  description:
    'Text, with inline markdown such as **bold**, *italics*, `code` and [links](https://…). In a chat Card with sources, [1] cites its first source. size: "small", "default", "large", "small-heavy" or "large-heavy" (for a KPI figure).',
  props: z.object({
    text: z.string(),
    size: z
      .enum(["small", "default", "large", "small-heavy", "large-heavy"])
      .optional(),
  }),
  component: ({ props, sources }) =>
    Typography.render({
      ...TEXT_SIZES[props.size ?? "default"],
      children: renderInlineMarkdown(withCitations(props.text, sources)),
    }),
})

export const MarkDownRenderer = defineComponent({
  name: "MarkDownRenderer",
  description:
    'Longer text in markdown: paragraphs, lists, headings, tables, code. variant "clear" (default), "card" or "sunk" sets it on a surface.',
  props: z.object({
    textMarkdown: z.string(),
    variant: z.enum(["clear", "card", "sunk"]).optional(),
  }),
  component: ({ props }) => {
    const text = html`<div
      class="iw-markdown"
      style="font-family: var(--iw-font-family-sans); color: var(--iw-color-text); line-height: var(--iw-line-height-normal); overflow-wrap: anywhere;"
    >
      ${renderMarkdown(props.textMarkdown)}
    </div>`
    const variant = props.variant ?? "clear"
    return when(
      variant === "clear",
      () => text,
      () => UiCard.render({ variant: CARD_VARIANTS[variant], children: text }),
    )
  },
})

/**
 * Text with its `[n]` citations as links to the sources they number, from
 * one; one with no such source, or no web link, stays as written.
 */
function withCitations(text, sources) {
  if (!sources?.length) return text
  return (text ?? "").replace(/\[(\d+)\](?!\()/g, (citation, number) => {
    const source = sources[Number(number) - FIRST_SOURCE]
    if (!WEB_URL.test(source?.url ?? "")) return citation
    const url = encodeURI(source.url).replace(/\)/g, "%29")
    const title = String(source.sourceName ?? "").replace(/"/g, "'")
    return `[\\[${number}\\]](${url} "${title}")`
  })
}
