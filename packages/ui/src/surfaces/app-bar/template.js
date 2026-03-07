/**
 * @typedef {import('../../../types/surfaces/app-bar').AppBarProps} AppBarProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {AppBarProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    title,
    subtitle,
    leading,
    trailing,
    children,
    dense = false,
    variant = "regular",
    color = "default",
    elevated = true,
    position = "static",
    placement = "top",
    className = "",
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const hasMeta = title || subtitle
  const effectiveVariant = dense ? "dense" : variant

  return html`<header
    class=${classMap({
      "iw-app-bar": true,
      "iw-app-bar-elevated": elevated,
      [`iw-app-bar-${effectiveVariant}`]: true,
      [`iw-app-bar-color-${color}`]: true,
      [`iw-app-bar-${position}`]: true,
      [`iw-app-bar-placement-${placement}`]: true,
      ...extraClasses,
    })}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${leading ? html`<div class="iw-app-bar-leading">${leading}</div>` : null}
    ${hasMeta
      ? html`<div class="iw-app-bar-meta">
          ${title ? html`<div class="iw-app-bar-title">${title}</div>` : null}
          ${subtitle
            ? html`<div class="iw-app-bar-subtitle">${subtitle}</div>`
            : null}
        </div>`
      : null}
    ${children ? html`<div class="iw-app-bar-content">${children}</div>` : null}
    ${trailing
      ? html`<div class="iw-app-bar-trailing">${trailing}</div>`
      : null}
  </header>`
}
