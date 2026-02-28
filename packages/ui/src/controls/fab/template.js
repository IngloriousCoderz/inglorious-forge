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
  const { children, extended = false, className = "", onClick, ...rest } = props

  return button.render({
    ...rest,
    shape: extended ? "pill" : "round",
    className:
      `iw-fab ${extended ? "iw-fab-extended" : ""} ${className}`.trim(),
    children: extended
      ? children
      : html`<span class="iw-fab-content">${children}</span>`,
    onClick,
  })
}
