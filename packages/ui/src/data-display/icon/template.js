/**
 * @typedef {import('../../../types/data-display/icon').IconProps} IconProps
 * @typedef {import('../../../types/data-display/icon').IconData} IconData
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { unsafeSVG } from "@inglorious/web/directives/unsafe-svg"

import { applyElementProps } from "../../shared/apply-element-props.js"

/**
 * Renders an inline icon with size and color control.
 *
 * `icon` takes an icon in the Iconify format, the one every set on
 * `@iconify-icons/*` exports: `import arrowBack from
 * "@iconify-icons/material-symbols/arrow-back"`. It is drawn as inline SVG at
 * 1em, so the size follows `size` and the color follows the text. Without
 * `icon`, `children` is shown instead: an emoji, a glyph, any markup.
 *
 * `direction` is the direction of the text the icon sits in: an icon that
 * points along the line, such as a back arrow, is mirrored with `"rtl"`.
 * `label` names an icon that means something on its own; without one the
 * icon is decorative and hidden from assistive technology.
 *
 * @param {IconProps} props
 * @returns {TemplateResult}
 */
export function render({
  icon,
  children,
  size = "md",
  color = "current",
  direction = "ltr",
  label,
  className = "",
  onClick,
}) {
  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<span
    class=${classMap({
      "iw-icon": true,
      [`iw-icon-${size}`]: true,
      "iw-icon-current": color === "current",
      "iw-icon-rtl": direction === "rtl",
      ...extraClasses,
    })}
    style=${color !== "current" ? `color: ${color};` : ""}
    @click=${onClick}
    ${ref((el) =>
      applyElementProps(el, {
        role: label ? "img" : null,
        "aria-label": label ?? null,
        "aria-hidden": label ? null : "true",
      }),
    )}
    >${icon ? renderSvg(icon) : children}</span
  >`
}

/**
 * The icon as an SVG one em square. The body comes from the icon set, which is
 * code the app chose to import, so it is inserted as markup. Iconify leaves out
 * a 16 by 16 box at the origin, the format's default.
 * @param {IconData} icon
 * @returns {TemplateResult}
 */
function renderSvg({ body, width = 16, height = 16, left = 0, top = 0 }) {
  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${left} ${top} ${width} ${height}"
    width="1em"
    height="1em"
    fill="currentColor"
    focusable="false"
  >
    ${unsafeSVG(body)}
  </svg>`
}
