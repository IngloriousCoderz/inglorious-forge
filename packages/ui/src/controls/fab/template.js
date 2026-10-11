/**
 * @typedef {import('../../../types/controls/fab').FabProps} FabProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { Button } from "../button/index.js"

/**
 * Renders a floating action button for primary contextual actions.
 * Supports extended mode to display label text alongside the icon.
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

  return Button.render({
    ...rest,
    shape: isExtended ? "pill" : "round",
    className:
      `iw-fab ${isExtended ? "iw-fab-extended" : ""} ${className}`.trim(),
    children,
    onClick,
  })
}
