/**
 * @typedef {import('../../../types/data-display/avatar').AvatarEntity} AvatarEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Avatar component.
 * @param {AvatarEntity} entity
 * @param {Api} _api
 * @returns {TemplateResult}
 */
export function render(entity) {
  const {
    src,
    alt = "avatar",
    initials,
    size = "md",
    shape = "circle",
    children,
  } = entity

  const classes = {
    "iw-avatar": true,
    [`iw-avatar-${size}`]: size !== "md",
    [`iw-avatar-${shape}`]: shape !== "circle",
  }

  return html`<span class=${classMap(classes)}>
    ${src
      ? html`<img class="iw-avatar-img" src=${src} alt=${alt} />`
      : (children ?? initials ?? "?")}
  </span>`
}
