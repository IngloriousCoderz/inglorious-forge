/**
 * @typedef {import('../../../types/controls/fab').FabEntity} FabEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Floating action button for primary contextual actions.
 *
 * @param {FabEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    children,
    color = "primary",
    size = "md",
    disabled = false,
    type = "button",
    extended = false,
    ariaLabel,
  } = entity

  const classes = {
    "iw-fab": true,
    [`iw-fab-${color}`]: color !== "primary",
    [`iw-fab-${size}`]: size !== "md",
    "iw-fab-extended": extended,
  }

  return html`
    <button
      type=${type}
      aria-label=${ariaLabel}
      class=${classMap(classes)}
      ?disabled=${disabled}
      @click=${() => api.notify(`#${entity.id}:click`)}
    >
      ${children}
    </button>
  `
}
