/**
 * @typedef {import('../../../types/data-display/badge').BadgeProps} BadgeProps
 */

import { classMap, html, styleMap } from "@inglorious/web"

export function render(props) {
  const {
    children,
    color = "primary",
    variant = "solid",
    size = "md",
    shape = "rectangle",
    ringWidth = 0,
    className = "",
    onClick,
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-badge": true,
    [`iw-badge-${color}`]: color !== "primary",
    [`iw-badge-${variant}`]: variant !== "solid",
    [`iw-badge-${size}`]: size !== "md",
    [`iw-badge-shape-${shape}`]: shape !== "rectangle",
    ...extraClasses,
  }

  const styles = {}
  if (ringWidth) {
    styles["--iw-badge-ring-width"] = ringWidth
  }

  return html`<span
    class=${classMap(classes)}
    style=${styleMap(styles)}
    @click=${onClick}
    >${children}</span
  >`
}
