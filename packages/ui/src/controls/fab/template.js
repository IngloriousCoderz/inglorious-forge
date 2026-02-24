/**
 * @typedef {import('../../../types/controls/fab').FabEntity} FabEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"

import { buttonPrimitive as button } from "../button/index.js"

/**
 * Floating action button for primary contextual actions.
 *
 * @param {FabEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const { children, extended = false, className = "", ...rest } = entity

  return button.render(
    {
      ...rest,
      shape: extended ? "pill" : "round",
      className:
        `iw-fab ${extended ? "iw-fab-extended" : ""} ${className}`.trim(),
      children: extended
        ? children
        : html`<span class="iw-fab-content">${children}</span>`,
    },
    api,
  )
}
