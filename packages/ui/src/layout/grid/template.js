/**
 * @typedef {import('../../../types/layout/grid').GridProps} GridProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, styleMap } from "@inglorious/web"

/**
 * Grid layout component for Inglorious Web.
 * Children are rendered as-is (templates/content composition).
 *
 * @param {GridProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    columns = 0,
    minColumnWidth = 0,
    gap = "md",
    align = "stretch",
    justify = "stretch",
    fullWidth = false,
    children = [],
    onClick,
  } = props

  const classes = {
    "iw-grid": true,
    "iw-grid-full-width": fullWidth,
    [`iw-grid-gap-${gap}`]: true,
    [`iw-grid-align-${align}`]: align !== "stretch",
    [`iw-grid-justify-${justify}`]: justify !== "stretch",
  }

  const styles = {
    gridTemplateColumns: `repeat(${columns || "auto-fit"}, minmax(${minColumnWidth}, 1fr))`,
  }

  return html`<div
    class=${classMap(classes)}
    style=${styleMap(styles)}
    @click=${onClick}
  >
    ${children}
  </div>`
}
