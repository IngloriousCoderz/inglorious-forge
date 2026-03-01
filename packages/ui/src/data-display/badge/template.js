/**
 * @typedef {import('../../../types/data-display/badge').BadgeProps} BadgeProps
 */

import { classMap, html } from "@inglorious/web"

export function render(props) {
  const {
    children,
    color = "primary",
    variant = "solid",
    size = "md",
    onClick,
  } = props

  const classes = {
    "iw-badge": true,
    [`iw-badge-${color}`]: color !== "primary",
    [`iw-badge-${variant}`]: variant !== "solid",
    [`iw-badge-${size}`]: size !== "md",
  }

  return html`<span class=${classMap(classes)} @click=${onClick}
    >${children}</span
  >`
}
