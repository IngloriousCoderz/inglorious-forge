/**
 * @typedef {import('../../../types/data-display/tooltip').TooltipProps} TooltipProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a tooltip trigger and bubble with positional styling.
 * Use `isOpen` to control visibility and `content` to set the tooltip body.
 * @param {TooltipProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    children,
    content,
    position = "top",
    size = "md",
    isOpen = false,
    maxWidth = "20rem",
    className = "",
    onClick,
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-tooltip": true,
    "iw-tooltip-open": isOpen,
    [`iw-tooltip-${position}`]: position !== "top",
    [`iw-tooltip-size-${size}`]: size !== "md",
    ...extraClasses,
  }

  return html`
    <span
      class=${classMap(classes)}
      ${ref((el) => applyElementProps(el, rest))}
      @click=${onClick}
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
