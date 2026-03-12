/**
 * @typedef {import('../../../types/surfaces/paper').PaperProps} PaperProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {PaperProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    children,
    variant = "elevated",
    elevation = 1,
    radius = "md",
    padding = "md",
    className = "",
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<div
    class=${classMap({
      "iw-paper": true,
      [`iw-paper-${variant}`]: true,
      [`iw-paper-elevation-${Math.max(0, Math.min(4, elevation))}`]:
        variant === "elevated",
      [`iw-paper-padding-${padding}`]: true,
      [`iw-paper-radius-${radius}`]: radius !== "md",
      ...extraClasses,
    })}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${children}
  </div>`
}
