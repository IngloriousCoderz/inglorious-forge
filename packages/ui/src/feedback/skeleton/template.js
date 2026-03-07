/**
 * @typedef {import('../../../types/feedback/skeleton').SkeletonProps} SkeletonProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * @param {SkeletonProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const { variant = "text", width, height, lines = 1, className = "" } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const style = [
    width != null
      ? `width: ${typeof width === "number" ? `${width}px` : width};`
      : "",
    height != null
      ? `height: ${typeof height === "number" ? `${height}px` : height};`
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  const classes = {
    "iw-skeleton": true,
    [`iw-skeleton-${variant}`]: variant !== "text",
    ...extraClasses,
  }

  if (lines > 1) {
    return html`<div class="iw-skeleton-stack">
      ${Array.from({ length: lines }).map(
        () => html`<div class=${classMap(classes)} style=${style}></div>`,
      )}
    </div>`
  }

  return html`<div class=${classMap(classes)} style=${style}></div>`
}
