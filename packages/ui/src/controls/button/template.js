/**
 * @typedef {import('../../../types/controls/button').ButtonProps} ButtonProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a themed button for actions and form submission.
 * Supports variants, sizes, shapes, pressed state, and full-width layout.
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
    color = "default",
    size = "md",
    shape = "rectangle",
    isDisabled = false,
    isPressed = false,
    isFullWidth = false,
    buttonType = "button",
    ariaLabel = "",
    isAriaPressed = false,
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
    [`iw-button-${color}`]: true,
    [`iw-button-${size}`]: true,
    [`iw-button-pressed`]: isPressed,
    [`iw-button-shape-${shape}`]: shape !== "rectangle",
    "iw-button-full-width": isFullWidth,
    "iw-button-disabled": isDisabled,
    ...extraClasses,
  }

  return html`
    <button
      type=${buttonType}
      aria-label=${ariaLabel}
      aria-pressed=${isAriaPressed}
      class=${classMap(classes)}
      ?disabled=${isDisabled}
      @click=${onClick}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${children}
    </button>
  `
}
