import { html, render } from "lit-html"

/**
 * Mounts a lit-html template to the DOM and subscribes to a store for re-rendering.
 * @param {import('@inglorious/store').Store} store - The application state store.
 * @param {(api: import('../types/mount').Api) => import('lit-html').TemplateResult | null} renderFn - The root render function.
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
 * @param {import('../types/mount').Api} api - The mount API.
 * @returns {import('../types/mount').Api['render']} A `render` function that can render an entity or a type by its ID.
 * @private
 */
function createRender(api) {
  return function (id, options = {}) {
    const entity = api.getEntity(id)

    if (!entity) {
      const { allowType } = options
      if (!allowType) {
        return ""
      }

      // No entity with this ID, try static type
      const type = api.getType(id)
      if (!type?.render) {
        console.warn(`No entity or type found: ${id}`)
        return html`<div>Not found: ${id}</div>`
      }
      return type.render(api)
    }

    // Entity exists, render it
    const type = api.getType(entity.type)
    if (!type?.render) {
      console.warn(`No render function for type: ${entity.type}`)
      return html`<div>No renderer for ${entity.type}</div>`
    }

    return type.render(entity, api)
  }
}
