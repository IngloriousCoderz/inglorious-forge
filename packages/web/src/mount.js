/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@inglorious/store').Store} Store */
/** @typedef {import('@inglorious/store').EntityType} EntityType */
/** @typedef {import('../types/mount').Api} Api */

import { html, render } from "lit-html"

import { isNative } from "./mobile/index.js"
import { createAccessibleNavigation } from "./router/accessible-navigation.js"

/**
 * Mounts a lit-html template to the DOM and subscribes to a store for re-rendering.
 * @param {Store} store - The application state store.
 * @param {(api: Api) => TemplateResult | null} renderFn - The root render function.
 * @param {HTMLElement | DocumentFragment} element - The DOM element to mount the template to.
 * In an app with the `Router` type, each navigation is also announced to screen readers
 * and moves focus back to the top of the new page, as a full page load would.
 *
 * @param {Object} [options] - Root error-boundary and navigation options.
 * @param {(error: unknown, api: Api) => void} [options.onError] - Called when the
 *   root render throws. Defaults to `console.error`.
 * @param {(error: unknown, api: Api) => TemplateResult | null} [options.fallback] -
 *   Optional fallback template rendered in place of the failed root render.
 * @param {boolean} [options.hasAccessibleNavigation=true] - Whether navigations are
 *   announced and move focus. Only apps with the `Router` type navigate.
 * @param {() => string | null} [options.getPageName] - The name to announce for the
 *   current page, or `null` while it is not known yet; by default the document title.
 * @returns {() => void} An unsubscribe function
 */
export async function mount(store, renderFn, element, options = {}) {
  const {
    onError = defaultOnError,
    fallback,
    hydrate: allowHydrate = true,
    hasAccessibleNavigation = true,
    getPageName,
  } = options

  // Tells CSS the native app from a browser tab, which env() cannot: the
  // safe-area tokens of @inglorious/ui key off it.
  document.documentElement.classList.toggle("iw-native", isNative())

  const api = { ...store._api }
  api.render = createRender(api)

  const shouldHydrate = allowHydrate && element.hasChildNodes()

  // If we need to hydrate, load the heavy lifting only now
  if (shouldHydrate) {
    const { hydrate } = await import("@lit-labs/ssr-client")
    const result = renderRoot(renderFn, api, onError, fallback)
    if (result.ok) {
      hydrate(result.template, element)
    } else if (fallback) {
      // Can't hydrate a render that threw: replace the server markup with the
      // fallback via a fresh client render instead.
      render(result.fallback, element)
    }
  }

  const afterRender =
    hasAccessibleNavigation && store.getType("Router")
      ? createAccessibleNavigation({ getPageName })
      : null

  const unsubscribe = store.subscribe(() => {
    const result = renderRoot(renderFn, api, onError, fallback)
    if (result.ok) {
      // Standard render is already in the main bundle (it's small)
      render(result.template, element)
    } else if (fallback) {
      render(result.fallback, element)
    }
    afterRender?.()
  })

  store.notify("init")
  return unsubscribe
}

/**
 * Root-level error boundary. Unlike the per-entity `withErrorBoundary`
 * decorator (which isolates a single failing type's render), this catches
 * errors thrown by the *root* render function itself — before any entity is
 * reached (e.g. a missing router entity), or by an unguarded child.
 *
 * Without it, a throwing root render takes down the whole app: on the initial
 * pass it aborts the mount, and inside the store subscription it throws out of
 * the notify loop on every subsequent update, freezing the UI. Catching it
 * keeps the subscription alive so one bad tick can't kill the app.
 *
 * @param {(api: Api) => TemplateResult | null} renderFn
 * @param {Api} api
 * @param {(error: unknown, api: Api) => void} onError
 * @param {((error: unknown, api: Api) => TemplateResult | null) | undefined} fallback
 * @returns {{ ok: true, template: TemplateResult | null } | { ok: false, fallback: TemplateResult | null }}
 */
function renderRoot(renderFn, api, onError, fallback) {
  try {
    return { ok: true, template: renderFn(api) }
  } catch (error) {
    onError(error, api)
    return { ok: false, fallback: fallback ? fallback(error, api) : null }
  }
}

/**
 * Default root-error handler: log without taking the app down.
 * @param {unknown} error - The error thrown by the root render function.
 */
function defaultOnError(error) {
  console.error("[mount] root render failed:", error)
}

/**
 * Creates a render function for the mount API.
 * @param {Api} api - The mount API.
 * @returns {Api['render']} A `render` function that can render an entity or a type by its ID.
 * @private
 */
function createRender(api) {
  return function (id, typeName, type) {
    registerTypeIfMissing(api, typeName, type)

    const entity = api.getEntity(id)

    if (!entity) {
      return ""
    }

    const entityType = api.getType(entity.type)
    if (!entityType?.render) {
      console.warn(`No render function for type: ${entity.type}`)
      return html`<div>No renderer for ${entity.type}</div>`
    }

    return entityType.render(entity, api)
  }
}

/**
 * Registers a type definition lazily when the caller provides one to render().
 * @param {Api} api - The mount API.
 * @param {string | undefined} typeName - The type name to register.
 * @param {EntityType | undefined} type - The type definition to register.
 */
function registerTypeIfMissing(api, typeName, type) {
  if (typeName && type && !api.getType(typeName)) {
    api.setType(typeName, type)
  }
}
