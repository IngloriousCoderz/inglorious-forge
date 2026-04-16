/**
 * @typedef {import('../../../types/data-display/badge').BadgeProps} BadgeProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { styleMap } from "@inglorious/web/directives/style-map"

/**
 * Renders a compact badge for status, labels, or counts.
 * Supports color, variant, size, shape, and optional ring styling.
 * @param {BadgeProps} props
 * @returns {TemplateResult}
 */
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
