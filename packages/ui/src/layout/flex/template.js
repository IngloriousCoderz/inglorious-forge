/**
 * @typedef {import('../../../types/layout/flex').FlexEntity} FlexEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Flex layout component for Inglorious Web.
 * Children are rendered as-is (templates/content composition).
 *
 * @param {FlexEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity) {
  const {
    direction = "row",
    wrap = "nowrap",
    justify = "start",
    align = "stretch",
    gap = "md",
    inline = false,
    fullWidth = false,
    children = [],
  } = entity

  const classes = {
    "iw-flex": true,
    "iw-flex-inline": inline,
    "iw-flex-full-width": fullWidth,
    [`iw-flex-direction-${direction}`]: true,
    [`iw-flex-wrap-${wrap}`]: true,
    [`iw-flex-justify-${justify}`]: true,
    [`iw-flex-align-${align}`]: true,
    [`iw-flex-gap-${gap}`]: true,
  }

  return html`<div class=${classMap(classes)}>${children}</div>`
}
