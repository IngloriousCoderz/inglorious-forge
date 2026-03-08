/**
 * @typedef {import('../../../types/controls/button').ButtonProps} ButtonProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Button type for Inglorious Web.
 *
 * @example
 * // Stateless usage
 * button.render({ children: 'Click me', variant: 'primary' })
 *
 * @param {ButtonProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    children,
    variant = "default",
    color = "",
    size = "md",
    shape = "rectangle",
    disabled = false,
    fullWidth = false,
    buttonType = "button",
    ariaLabel = "",
    ariaPressed = false,
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
    "iw-button": true,
    [`iw-button-${variant}`]: variant !== "default",
    [`iw-button-${color}`]: color !== "",
    [`iw-button-${size}`]: size !== "md",
    [`iw-button-shape-${shape}`]: shape !== "rectangle",
    "iw-button-full-width": fullWidth,
    "iw-button-disabled": disabled,
    ...extraClasses,
  }

  return html`
    <button
      type=${buttonType}
      aria-label=${ariaLabel}
      aria-pressed=${ariaPressed}
      class=${classMap(classes)}
      ?disabled=${disabled}
      @click=${onClick}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${children}
    </button>
  `
}
