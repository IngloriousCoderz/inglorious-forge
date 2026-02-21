/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@inglorious/store').Store} Store */
/** @typedef {import('@inglorious/web').Api} Api */

import { html } from "@inglorious/web"
import { render as ssrRender } from "@lit-labs/ssr"
import { collectResult } from "@lit-labs/ssr/lib/render-result.js"

import { layout as defaultLayout } from "./layout.js"

/**
 * Renders a page or component to HTML using the store state.
 * It handles SSR rendering of Lit templates and optional HTML wrapping.
 *
 * @param {Store} store - The application store instance.
 * @param {(api: Api) => TemplateResult | null} renderFn - The root render function.
 * @param {Object} [options] - Rendering options.
 * @param {boolean} [options.wrap=false] - Whether to wrap the output in a full HTML document.
 * @param {Function} [options.layout] - Custom layout function.
 * @param {boolean} [options.stripLitMarkers=false] - Whether to remove Lit hydration markers (for static output).
 * @param {Object} [options.ssxEntity] - Per-page entity state for client hydration.
 * @returns {Promise<string>} The generated HTML string.
 */
export async function toHTML(store, renderFn, options = {}) {
  const api = { ...store._api }
  api.render = createRender(api)

  // Generate the template
  const template = renderFn(api)

  // SSR render → HTML with hydration markers
  const result = ssrRender(template)
  const resultString = await collectResult(result)

  const finalHTML = options.stripLitMarkers
    ? stripLitMarkers(resultString)
    : resultString

  if (!options.wrap) return finalHTML

  const layout = options.layout ?? defaultLayout
  let html = layout(finalHTML, options)

  if (options.ssxEntity) {
    html = html.replace(
      /<body[^>]*>/,
      `$&<script type="application/json" id="__SSX_ENTITY__">${JSON.stringify(options.ssxEntity)}</script>`,
    )
  }

  return html
}

/**
 * Removes Lit hydration markers from the HTML string.
 * Useful for generating clean static HTML that doesn't need client-side hydration.
 *
 * @param {string} html - The HTML string with markers.
 * @returns {string} Cleaned HTML string.
 */
function stripLitMarkers(html) {
  return html
    .replace(/<!--\?[^>]*-->/g, "") // All lit-html markers
    .replace(/<!--\s*-->/g, "") // Empty comments
}

// TODO: this was copied from @inglorious/web, maybe expose it?
/**
 * Creates a render function for the mount API.
 * @param {Api} api - The mount API.
 * @returns {Api['render']} A `render` function that can render an entity or a type by its ID.
 * @private
 */
function createRender(api) {
  return function (id) {
    const entity = api.getEntity(id)

    if (!entity) {
      return ""
    }

    const type = api.getType(entity.type)
    if (!type?.render) {
      console.warn(`No render function for type: ${entity.type}`)
      return html`<div>No renderer for ${entity.type}</div>`
    }

    return type.render(entity, api)
  }
}
