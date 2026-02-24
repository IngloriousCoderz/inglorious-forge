/**
 * @typedef {import('../../../types/button').ButtonEntity} ButtonEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Button type for Inglorious Web.
 *
 * @example
 * // Stateless usage
 * button.render({ label: 'Click me', variant: 'primary' }, api)
 *
 * @example
 * // Stateful usage with event handling
 * // Entity: { type: 'button', id: 'submitBtn', label: 'Submit' }
 * // In store: api.render('submitBtn')
 *
 * @param {ButtonEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    label,
    variant = "default",
    color = "primary",
    size = "md",
    disabled = false,
    fullWidth = false,
    type = "button",
    icon,
    iconAfter,
  } = entity

  const classes = {
    "iw-button": true,
    [`iw-button-${variant}`]: variant !== "default",
    [`iw-button-${color}`]: color !== "primary",
    [`iw-button-${size}`]: size !== "md",
    "iw-button-full-width": fullWidth,
    "iw-button-disabled": disabled,
  }

  return html`
    <button
      type=${type}
      class=${classMap(classes)}
      ?disabled=${disabled}
      @click=${() => api.notify(`#${entity.id}:click`)}
    >
      ${icon ? html`<span class="iw-button-icon">${icon}</span>` : null}
      ${label}
      ${iconAfter
        ? html`<span class="iw-button-icon">${iconAfter}</span>`
        : null}
    </button>
  `
}
