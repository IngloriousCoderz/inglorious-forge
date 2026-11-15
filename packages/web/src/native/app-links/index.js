import { isNative } from "../index.js"

const DEFAULT_ROUTER = "router"
const URL_OPEN_EVENT = "appUrlOpen"

/**
 * The type that opens Universal Links and App Links in the app's router: a
 * link to the app's domain, tapped while the app is installed, opens the app
 * instead of the browser, and the router goes to the link's path. It covers a
 * link that starts the app as well as one that arrives while it runs. The
 * entity's `url` is the last link opened. Does nothing outside a native app.
 *
 * @param {Object} config
 * @param {Object} config.plugin `App` from `@capacitor/app`.
 * @param {string} [config.router] The router entity, `router` by default.
 *
 * @example
 * import { App } from "@capacitor/app"
 * const types = { AppLinks: createAppLinks({ plugin: App }) }
 * const entities = { appLinks: { type: "AppLinks" } }
 */
export function createAppLinks({ plugin, router = DEFAULT_ROUTER }) {
  const listeners = new Map()

  return {
    create(entity, _, api) {
      entity.url ??= null
      if (!isNative()) return

      const { id } = entity
      const open = (url) => api.notify(`#${id}:appLinkOpen`, url)

      plugin.getLaunchUrl().then(
        (launch) => {
          if (launch?.url) open(launch.url)
        },
        () => {
          // No launch URL to read is the same as none.
        },
      )
      listeners.set(
        id,
        plugin.addListener(URL_OPEN_EVENT, ({ url }) => open(url)),
      )
    },

    destroy(entity) {
      const listener = listeners.get(entity.id)
      listeners.delete(entity.id)
      listener?.then((handle) => handle.remove())
    },

    appLinkOpen(entity, url, api) {
      entity.url = url
      const path = toPath(url)
      if (path) api.notify(`#${router}:navigate`, path)
    },
  }
}

function toPath(url) {
  try {
    const { pathname, search, hash } = new URL(url)
    return `${pathname}${search}${hash}`
  } catch {
    return null
  }
}
