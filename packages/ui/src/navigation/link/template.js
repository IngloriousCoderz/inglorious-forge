/**
 * @typedef {import('../../../types/navigation/link').LinkProps} LinkProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {LinkProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    href,
    children,
    label,
    underline = "hover",
    color = "primary",
    isMuted = false,
    isExternal = false,
    className = "",
    onClick,
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<a
    href=${href ?? "#"}
    class=${classMap({
      "iw-link": true,
      [`iw-link-underline-${underline}`]: true,
      [`iw-link-color-${color}`]: !isMuted,
      "iw-link-muted": isMuted,
      "iw-link-external": isExternal,
      ...extraClasses,
    })}
    target=${isExternal ? "_blank" : null}
    rel=${isExternal ? "noreferrer noopener" : null}
    @click=${onClick}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${children ?? label}
  </a>`
}
