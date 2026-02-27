/**
 * @typedef {import('../../../types/controls/button').ButtonEntity} ButtonEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Button type for Inglorious Web.
 *
 * @example
 * // Stateless usage
 * button.render({ children: 'Click me', variant: 'primary' }, api)
 *
 * @example
 * // Stateful usage with event handling
 * // Entity: { type: 'button', id: 'submitBtn', children: 'Submit' }
 * // In store: api.render('submitBtn')
 *
 * @param {ButtonEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    children,
    variant = "default",
    color = "primary",
    size = "md",
    shape = "rectangle",
    disabled = false,
    fullWidth = false,
    buttonType = "button",
    ariaLabel = "",
    ariaPressed = false,
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
    "iw-button": true,
    [`iw-button-${variant}`]: variant !== "default",
    [`iw-button-${color}`]: color !== "primary",
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
      @click=${() => api.notify(`#${id}:click`)}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${children}
    </button>
  `
}
