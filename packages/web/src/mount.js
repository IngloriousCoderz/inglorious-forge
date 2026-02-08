/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@inglorious/store').Store} Store */
/** @typedef {import('../types/mount').Api} Api */

import { html, render } from "lit-html"

/**
 * Mounts a lit-html template to the DOM and subscribes to a store for re-rendering.
 * @param {Store} store - The application state store.
 * @param {(api: Api) => TemplateResult | null} renderFn - The root render function.
 * @param {HTMLElement | DocumentFragment} element - The DOM element to mount the template to.
 * @returns {() => void} An unsubscribe function
 */
export async function mount(store, renderFn, element) {
  const api = { ...store._api }
  api.render = createRender(api)

  let shouldHydrate = element.hasChildNodes()

  // If we need to hydrate, load the heavy lifting only now
  if (shouldHydrate) {
    const { hydrate } = await import("@lit-labs/ssr-client")
    const template = renderFn(api)
    hydrate(template, element)
    shouldHydrate = false
  }

  const unsubscribe = store.subscribe(() => {
    const template = renderFn(api)
    // Standard render is already in the main bundle (it's small)
    render(template, element)
  })

  store.notify("init")
  return unsubscribe
}

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
