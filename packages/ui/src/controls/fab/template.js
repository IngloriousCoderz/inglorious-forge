/**
 * @typedef {import('../../../types/controls/fab').FabProps} FabProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"

import { button } from "../button/index.js"

/**
 * Floating action button for primary contextual actions.
 *
 * @param {FabProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    children,
    isExtended = false,
    className = "",
    onClick,
    ...rest
  } = props

  return button.render({
    ...rest,
    shape: isExtended ? "pill" : "round",
    className:
      `iw-fab ${isExtended ? "iw-fab-extended" : ""} ${className}`.trim(),
    children: isExtended
      ? children
      : html`<span class="iw-fab-content">${children}</span>`,
    onClick,
  })
}
