import { Alert } from "@inglorious/ui/alert"
import { Card as UiCard } from "@inglorious/ui/card"
import { Chip } from "@inglorious/ui/chip"
import { Dialog } from "@inglorious/ui/dialog"
import { Flex } from "@inglorious/ui/flex"
import { Grid } from "@inglorious/ui/grid"
import { Icon as UiIcon } from "@inglorious/ui/icon"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { renderInlineMarkdown, renderMarkdown } from "../markdown.js"
import { reactive } from "../reactive.js"
import { flexProps, toFlex } from "./layout.js"

/** OpenUI's text sizes as Typography variants and weights. */
const TEXT_SIZES = {
  small: { variant: "caption" },
  default: { variant: "body" },
  large: { variant: "h3" },
  "small-heavy": { variant: "caption", weight: 600 },
  "large-heavy": { variant: "h2", weight: 700 },
}

/** No image of a gallery is open in its preview. */
const NO_PREVIEW = -1

/** OpenUI's card surfaces in Card's names. */
const CARD_VARIANTS = { card: "default", sunk: "sunk", clear: "clear" }

export const Card = defineComponent({
  name: "Card",
  description:
    'Groups related content on a surface: "card" (default) raised, "sunk" set into the page, "clear" with none. Lays its children out like Stack.',
  props: z.object({
    children: z.array(z.any()),
    variant: z.enum(["card", "sunk", "clear"]).optional(),
    ...flexProps,
  }),
  component: ({ props, renderNode }) =>
    UiCard.render({
      variant: CARD_VARIANTS[props.variant ?? "card"],
      children: Flex.render({
        ...toFlex(props),
        children: renderNode(props.children),
      }),
    }),
})

export const CardHeader = defineComponent({
  name: "CardHeader",
  description: "A title with an optional subtitle, heading a card or section",
  props: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }),
  component: ({ props }) =>
    html`${when(props.title, () => Typography.render({ variant: "h3", children: props.title }))}
    ${when(props.subtitle, () =>
      Typography.render({
        variant: "caption",
        color: "secondary",
        children: props.subtitle,
      }),
    )}`,
})

export const TextContent = defineComponent({
  name: "TextContent",
  description:
    'Text, with inline markdown such as **bold**, *italics*, `code` and [links](https://…). size: "small", "default", "large", "small-heavy" or "large-heavy" (for a KPI figure).',
  props: z.object({
    text: z.string(),
    size: z
      .enum(["small", "default", "large", "small-heavy", "large-heavy"])
      .optional(),
  }),
  component: ({ props }) =>
    Typography.render({
      ...TEXT_SIZES[props.size ?? "default"],
      children: renderInlineMarkdown(props.text),
    }),
})

export const Callout = defineComponent({
  name: "Callout",
  description:
    'A highlighted message. visible is an optional $boolean: true shows it, and it clears itself after 3 seconds, for a "saved" message an action sets.',
  props: z.object({
    variant: z.enum(["info", "warning", "error", "success", "neutral"]),
    title: z.string(),
    description: z.string(),
    visible: reactive(z.boolean().optional()),
  }),
  component: ({ props, stateField, statementId }) => {
    // Bound to a $variable, as in Callout(..., $saved), it shows while true.
    const visible = stateField(
      `${statementId ?? "callout"}:visible`,
      props.visible,
    )
    return when(visible.value !== false, () =>
      Alert.render({
        severity: props.variant,
        variant: "outlined",
        title: props.title,
        description: renderInlineMarkdown(props.description),
      }),
    )
  },
})

const TAG_COLORS = {
  neutral: "default",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "error",
}

export const Icon = defineComponent({
  name: "Icon",
  description:
    "An icon by kebab-case name, such as 'circle-check' or 'rocket'. category, such as 'finance' or 'time', describes it when the name is unknown.",
  props: z.object({
    name: z.string(),
    category: z.string().optional(),
  }),
  // Drawn from the icons the app gives createOpenUI; an unknown one is left out.
  component: ({ props, iconFor }) => {
    const icon = iconFor(props.name)
    return when(icon, () => UiIcon.render({ icon }))
  },
})

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

export const Image = defineComponent({
  name: "Image",
  description: "An image with alt text and an optional URL",
  props: z.object({ alt: z.string(), src: z.string().optional() }),
  component: ({ props }) =>
    when(
      props.src,
      () =>
        html`<img
          src=${props.src}
          alt=${props.alt}
          loading="lazy"
          style="max-inline-size: 100%; block-size: auto;"
        />`,
    ),
})

/** OpenUI's callout tones in Alert's severities. */
const SEVERITIES = {
  neutral: "neutral",
  info: "info",
  warning: "warning",
  success: "success",
  danger: "error",
}

export const TextCallout = defineComponent({
  name: "TextCallout",
  description:
    "A note set apart from the text around it, always shown: a tip, a caveat, a warning.",
  props: z.object({
    variant: z
      .enum(["neutral", "info", "warning", "success", "danger"])
      .optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
  component: ({ props }) =>
    Alert.render({
      severity: SEVERITIES[props.variant ?? "neutral"],
      title: props.title,
      description: when(props.description, () =>
        renderInlineMarkdown(props.description),
      ),
    }),
})

export const InlineHeader = defineComponent({
  name: "InlineHeader",
  description:
    "A compact heading with an optional one-line description, labelling a block inside a card. Lighter than CardHeader.",
  props: z.object({
    heading: z.string(),
    description: z.string().optional(),
  }),
  component: ({ props }) =>
    Flex.render({
      direction: "column",
      gap: "xs",
      children: [
        Typography.render({ weight: 600, children: props.heading }),
        when(props.description, () =>
          Typography.render({
            variant: "caption",
            color: "secondary",
            children: props.description,
          }),
        ),
      ],
    }),
})

export const CodeBlock = defineComponent({
  name: "CodeBlock",
  description:
    'Code, kept exactly as written: CodeBlock("js", "const total = a + b")',
  props: z.object({
    language: z.string(),
    codeString: z.string(),
  }),
  component: ({ props }) =>
    html`<pre
      data-language=${props.language}
      style="margin: 0; padding: var(--iw-space-3); overflow: auto; border-radius: var(--iw-radius-md); background: var(--iw-color-bg-secondary); font-family: var(--iw-font-family-mono); font-size: var(--iw-font-size-sm);"
    ><code class=${`language-${props.language}`}>${props.codeString}</code></pre>`,
})

export const ImageBlock = defineComponent({
  name: "ImageBlock",
  description: "An image as wide as its container, such as a cover or a photo",
  props: z.object({ src: z.string(), alt: z.string().optional() }),
  component: ({ props }) =>
    html`<img
      src=${props.src}
      alt=${props.alt ?? ""}
      loading="lazy"
      style="display: block; inline-size: 100%; block-size: auto; border-radius: var(--iw-radius-md);"
    />`,
})

export const ImageGallery = defineComponent({
  name: "ImageGallery",
  description:
    "A grid of images, each opening larger with its details when pressed: ImageGallery([{src, alt, details}])",
  props: z.object({
    images: z.array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
        details: z.string().optional(),
      }),
    ),
  }),
  component: ({ props, viewState, statementId }) => {
    const images = (props.images ?? []).filter((image) => image?.src)
    const preview = viewState(`${statementId ?? "gallery"}:preview`, NO_PREVIEW)
    const open = images[preview.value]

    return html`${Grid.render({
      minColumnWidth: "8rem",
      gap: "sm",
      children: images.map(
        (image, index) =>
          html`<figure style="margin: 0;">
            <button
              type="button"
              aria-label=${`Open ${image.alt || "image"}`}
              style="display: block; inline-size: 100%; padding: 0; border: 0; background: none; cursor: zoom-in;"
              @click=${() => preview.setValue(index)}
            >
              <img
                src=${image.src}
                alt=${image.alt ?? ""}
                loading="lazy"
                style="display: block; inline-size: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--iw-radius-sm);"
              />
            </button>
          </figure>`,
      ),
    })}
    ${Dialog.render({
      isOpen: Boolean(open),
      title: open?.alt ?? "",
      size: "lg",
      onClose: () => preview.setValue(NO_PREVIEW),
      children: when(
        open,
        () =>
          html`<img
              src=${open.src}
              alt=${open.alt ?? ""}
              style="display: block; inline-size: 100%; block-size: auto;"
            />
            ${when(open.details, () =>
              Typography.render({ children: open.details }),
            )}`,
      ),
    })}`
  },
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
