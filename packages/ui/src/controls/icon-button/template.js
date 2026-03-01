/**
 * @typedef {import('../../../types/controls/icon-button').IconButtonProps} IconButtonProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"

import { button } from "../button/index.js"

/**
 * Icon button wrapper built on top of the base button renderer.
 *
 * @param {IconButtonProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    icon,
    label,
    iconAfter,
    direction = "row",
    onClick,
  } = props

  const children = html`
    <span class="iw-icon-button-content iw-icon-button-content-${direction}">
      ${icon ? html`<span class="iw-button-icon">${icon}</span>` : null}
      ${label}
      ${iconAfter
        ? html`<span class="iw-button-icon">${iconAfter}</span>`
        : null}
    </span>
  `

  return button.render({
    ...props,
    children,
    onClick,
  })
}
