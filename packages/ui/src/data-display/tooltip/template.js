/**
 * @typedef {import('../../../types/data-display/tooltip').TooltipEntity} TooltipEntity
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {TooltipEntity} entity
 * @returns {TemplateResult}
 */
export function render(entity) {
  const {
    children,
    content,
    position = "top",
    size = "md",
    open = false,
    maxWidth = "20rem",
    className = "",
    ...rest
  } = entity

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-tooltip": true,
    "iw-tooltip-open": open,
    [`iw-tooltip-${position}`]: position !== "top",
    [`iw-tooltip-size-${size}`]: size !== "md",
    ...extraClasses,
  }

  return html`
    <span
      class=${classMap(classes)}
      ${ref((el) => applyElementProps(el, rest))}
    >
      <span class="iw-tooltip-trigger">${children ?? "?"}</span>
      <span
        class="iw-tooltip-bubble"
        role="tooltip"
        style=${`max-width: ${maxWidth};`}
      >
        ${content}
      </span>
    </span>
  `
}
