/**
 * @typedef {import('../../../types/controls/icon-button').IconButtonProps} IconButtonProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"

import { Button } from "../button/index.js"

/**
 * Renders a button optimized for icons with optional label and icon placement.
 * Built on top of the base button renderer for consistent theming.
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

  return Button.render({
    ...props,
    children,
    onClick,
  })
}
