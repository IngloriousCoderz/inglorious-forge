/** @typedef {import('../../../types/button').ButtonEntity} ButtonEntity */
/** @typedef {import('@inglorious/web').Api} Api */
/** @typedef {import('@inglorious/web').TemplateResult} TemplateResult */

import { classMap, html } from "@inglorious/web"

/**
 * Button component for Inglorious Web.
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
    [`iw-button--${variant}`]: variant !== "default",
    [`iw-button--${color}`]: color !== "primary",
    [`iw-button--${size}`]: size !== "md",
    "iw-button--full-width": fullWidth,
    "iw-button--disabled": disabled,
  }

  return html`
    <button
      type=${type}
      class=${classMap(classes)}
      ?disabled=${disabled}
      @click=${() => api.notify(`#${entity.id}:click`)}
    >
      ${icon ? html`<span class="iw-button__icon">${icon}</span>` : null}
      ${label}
      ${iconAfter
        ? html`<span class="iw-button__icon">${iconAfter}</span>`
        : null}
    </button>
  `
}

/**
 * Click event handler for stateful button usage.
 * @param {ButtonEntity} entity
 * @param {*} payload
 * @param {API} api
 */
export function click(entity, payload, api) {
  entity.onClick?.(entity, api)
}

export const button = {
  render,
  click,
}
