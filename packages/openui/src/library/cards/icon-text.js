import { html } from "@inglorious/web"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Icon } from "../content/icon.js"
import { renderMediaText } from "./helpers.js"

/** An icon badge's side, in pixels, by OpenUI's size names. */
const BADGE_SIZES = {
  xs: 20,
  s: 24,
  sm: 24,
  m: 32,
  md: 32,
  l: 40,
  lg: 40,
  xl: 48,
}

/** The tint and colour of an icon badge, by OpenUI's variant names. */
const BADGES = {
  neutral: ["var(--iw-color-bg-secondary)", "var(--iw-color-text)"],
  info: tinted("info"),
  success: tinted("success"),
  warning: tinted("warning"),
  danger: tinted("error"),
  inverted: ["var(--iw-color-text)", "var(--iw-color-bg)"],
  filled: ["var(--iw-color-primary)", "#fff"],
  soft: tinted("primary"),
}

export const IconText = defineComponent({
  name: "IconText",
  description:
    'An Icon in a tinted badge with a title and optional subtitle. iconVariant: "neutral", "info", "success", "warning", "danger", "inverted", "filled" or "soft".',
  props: z.object({
    icon: Icon.ref,
    iconVariant: z
      .enum([
        "neutral",
        "info",
        "success",
        "warning",
        "danger",
        "inverted",
        "filled",
        "soft",
      ])
      .optional(),
    iconSize: z.enum(["xs", "s", "m", "l", "xl", "sm", "md", "lg"]).optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    bold: z.boolean().optional(),
    layout: z.enum(["horizontal", "vertical"]).optional(),
  }),
  component: ({ props, renderNode }) => {
    const [background, color] = BADGES[props.iconVariant ?? "neutral"]
    const side = BADGE_SIZES[props.iconSize ?? "m"]
    return renderMediaText(
      props,
      html`<span
        aria-hidden="true"
        style="display: inline-grid; place-items: center; flex: none; inline-size: ${side}px; block-size: ${side}px; border-radius: var(--iw-radius-md); background: ${background}; color: ${color};"
        >${renderNode(props.icon)}</span
      >`,
    )
  },
})

function tinted(color) {
  return [
    `color-mix(in srgb, var(--iw-color-${color}) 15%, transparent)`,
    `var(--iw-color-${color})`,
  ]
}
