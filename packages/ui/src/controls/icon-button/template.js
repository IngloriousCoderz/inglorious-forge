/**
 * @typedef {import('../../../types/controls/icon-button').IconButtonEntity} IconButtonEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"

import { render as renderButton } from "../button/template.js"

/**
 * Icon button wrapper built on top of the base button renderer.
 *
 * @param {IconButtonEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    icon,
    label,
    iconAfter,
    direction = "row",
    iconOnly = false,
    ariaLabel,
  } = entity

  const children = html`
    <span class="iw-icon-button-content iw-icon-button-content-${direction}">
      ${icon ? html`<span class="iw-button-icon">${icon}</span>` : null}
      ${iconOnly ? null : label}
      ${iconAfter
        ? html`<span class="iw-button-icon">${iconAfter}</span>`
        : null}
    </span>
  `

  return renderButton(
    {
      ...entity,
      label: iconOnly ? "" : label,
      children,
      ariaLabel,
    },
    api,
  )
}
