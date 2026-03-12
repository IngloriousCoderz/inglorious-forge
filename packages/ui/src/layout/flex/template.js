/**
 * @typedef {import('../../../types/layout/flex').FlexProps} FlexProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Flex layout component for Inglorious Web.
 * Children are rendered as-is (templates/content composition).
 *
 * @param {FlexProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    direction = "row",
    wrap = "nowrap",
    justify = "start",
    align = "stretch",
    gap = "md",
    padding = "none",
    isInline = false,
    isFullWidth = false,
    className = "",
    children = [],
    onClick,
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-flex": true,
    "iw-flex-inline": isInline,
    "iw-flex-full-width": isFullWidth,
    [`iw-flex-direction-${direction}`]: true,
    [`iw-flex-wrap-${wrap}`]: true,
    [`iw-flex-justify-${justify}`]: true,
    [`iw-flex-align-${align}`]: true,
    [`iw-flex-gap-${gap}`]: true,
    [`iw-flex-padding-${padding}`]: true,
    ...extraClasses,
  }

  return html`<div class=${classMap(classes)} @click=${onClick}>
    ${children}
  </div>`
}
