/**
 * @typedef {import('../../../types/controls/button').ButtonEntity} ButtonEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

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
    children,
    variant = "default",
    color = "primary",
    size = "md",
    disabled = false,
    fullWidth = false,
    type = "button",
    ariaLabel = "",
    ariaPressed = false,
    className = "",
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
    "iw-button-full-width": fullWidth,
    "iw-button-disabled": disabled,
    ...extraClasses,
  }

  return html`
    <button
      type=${type}
      aria-label=${ariaLabel}
      aria-pressed=${ariaPressed}
      class=${classMap(classes)}
      ?disabled=${disabled}
      @click=${() => api.notify(`#${entity.id}:click`)}
    >
      ${children}
    </button>
  `
}
