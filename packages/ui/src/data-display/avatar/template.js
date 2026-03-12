/**
 * @typedef {import('../../../types/data-display/avatar').AvatarProps} AvatarProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, styleMap } from "@inglorious/web"

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
    color = "default",
    backgroundColor,
    textColor,
    children,
    onClick,
  } = props

  const hasCustomBackground = Boolean(backgroundColor)
  const resolvedColor =
    color === "auto" && !hasCustomBackground ? "default" : color
  const classes = {
    "iw-avatar": true,
    [`iw-avatar-${size}`]: size !== "md",
    [`iw-avatar-${shape}`]: shape !== "circle",
    [`iw-avatar-color-${resolvedColor}`]:
      resolvedColor !== "default" && !hasCustomBackground,
  }

  const styles = {}
  if (backgroundColor) {
    styles.background = backgroundColor
    styles.color = textColor ?? "var(--iw-color-white)"
  } else if (color === "auto") {
    const seed = getAutoSeed(initials, children)
    if (seed) {
      styles.background = hashToHsl(seed)
      styles.color = textColor ?? "var(--iw-color-white)"
    }
  } else if (textColor) {
    styles.color = textColor
  }

  return html`<span
    class=${classMap(classes)}
    style=${styleMap(styles)}
    @click=${onClick}
  >
    ${src
      ? html`<img class="iw-avatar-img" src=${src} alt=${alt} />`
      : (children ?? initials ?? "?")}
  </span>`
}

function getAutoSeed(initials, children) {
  return String(
    initials ??
      (typeof children === "string" || typeof children === "number"
        ? children
        : ""),
  ).trim()
}

function hashToHsl(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 65% 45%)`
}
