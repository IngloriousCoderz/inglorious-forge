import { html, ref } from "@inglorious/web"

import { DEFAULT_THEME_CLASS } from "./defaults.js"
import { mountOrUpdateGrid } from "./runtime.js"
import { warnOnce } from "./warnings.js"

/**
 * @typedef {Record<string, any> & {
 *   themeClass?: string
 *   height?: number | string
 * }} AgGridRenderableEntity
 */

/**
 * Renders the AG Grid host element and delegates lifecycle to runtime helpers.
 * @param {AgGridRenderableEntity} entity
 * @param {{ notify: (event: string, payload?: any) => void }} api
 * @returns {import("lit-html").TemplateResult}
 */
export function render(entity, api) {
  const height =
    typeof entity.height === "number" ? `${entity.height}px` : entity.height
  const themeClass = resolveThemeClass(entity.themeClass)

  return html`
    <div
      class=${themeClass}
      style="width: 100%; height: ${height};"
      ${ref((el) => {
        if (!el) return
        mountOrUpdateGrid(entity, el, api)
      })}
    ></div>
  `
}

/**
 * Ensures a non-empty AG Grid theme class and warns once in dev when invalid.
 * @param {unknown} themeClass
 * @returns {string}
 */
function resolveThemeClass(themeClass) {
  if (typeof themeClass === "string" && themeClass.trim()) {
    return themeClass
  }

  warnOnce(
    "empty-theme-class",
    `Missing or empty "themeClass". Falling back to "${DEFAULT_THEME_CLASS}".`,
  )
  return DEFAULT_THEME_CLASS
}
