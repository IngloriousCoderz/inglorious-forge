/**
 * @typedef {import('../../../types/surfaces/app-bar').AppBarProps} AppBarProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, when } from "@inglorious/web"

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
    isDense = false,
    variant = "regular",
    color = "default",
    isElevated = true,
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
  const effectiveVariant = isDense ? "dense" : variant

  return html`<header
    class=${classMap({
      "iw-app-bar": true,
      "iw-app-bar-elevated": isElevated,
      [`iw-app-bar-${effectiveVariant}`]: true,
      [`iw-app-bar-color-${color}`]: true,
      [`iw-app-bar-${position}`]: true,
      [`iw-app-bar-placement-${placement}`]: true,
      ...extraClasses,
    })}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${when(
      leading,
      () => html`<div class="iw-app-bar-leading">${leading}</div>`,
    )}
    ${when(
      hasMeta,
      () =>
        html`<div class="iw-app-bar-meta">
          ${when(
            title,
            () => html`<div class="iw-app-bar-title">${title}</div>`,
          )}
          ${when(
            subtitle,
            () => html`<div class="iw-app-bar-subtitle">${subtitle}</div>`,
          )}
        </div>`,
    )}
    ${children}
    ${when(
      trailing,
      () => html`<div class="iw-app-bar-trailing">${trailing}</div>`,
    )}
  </header>`
}
