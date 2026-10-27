import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { when } from "@inglorious/web/directives/when"

/** Text sizes as Typography variants. */
export const TEXT_SIZES = { xs: "caption", sm: "body", md: "body", lg: "h3" }

export const BOLD = 700

export const SEMIBOLD = 600

export const SECONDARY = "var(--iw-color-text-secondary)"

export const NUMBERS = "font-variant-numeric: tabular-nums;"

/** A badge or image beside, or above, a title and its subtitle. */
export function renderMediaText(props, media) {
  const isVertical = props.layout === "vertical"
  return Flex.render({
    direction: isVertical ? "column" : "row",
    align: isVertical ? "start" : "center",
    gap: "sm",
    children: [media, renderTitles(props)],
  })
}

export function renderTitles({ title, subtitle, bold }) {
  return Flex.render({
    direction: "column",
    gap: "none",
    children: [
      Typography.render({ weight: bold ? BOLD : SEMIBOLD, children: title }),
      when(subtitle, () =>
        Typography.render({
          variant: "caption",
          color: SECONDARY,
          children: subtitle,
        }),
      ),
    ],
  })
}
