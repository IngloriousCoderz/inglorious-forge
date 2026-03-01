/**
 * @typedef {import('../../../types/data-display/avatar').AvatarProps} AvatarProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Avatar component.
 * @param {AvatarProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    src,
    alt = "avatar",
    initials,
    size = "md",
    shape = "circle",
    children,
    onClick,
  } = props

  const classes = {
    "iw-avatar": true,
    [`iw-avatar-${size}`]: size !== "md",
    [`iw-avatar-${shape}`]: shape !== "circle",
  }

  return html`<span class=${classMap(classes)} @click=${onClick}>
    ${src
      ? html`<img class="iw-avatar-img" src=${src} alt=${alt} />`
      : (children ?? initials ?? "?")}
  </span>`
}
