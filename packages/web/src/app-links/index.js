import { isNative } from "../mobile/index.js"

const DEFAULT_ID = "router"
const URL_OPEN_EVENT = "appUrlOpen"

/**
 * Opens Universal Links and App Links in the app's router: a link to the
 * app's domain, tapped while the app is installed, opens the app instead of
 * the browser, and the router goes to the link's path. Covers a link that
 * starts the app as well as one that arrives while it runs. Does nothing
 * outside a native app.
 *
 * @param {Object} app `App` from `@capacitor/app`.
 * @param {{ notify: (type: string, payload?: unknown) => void }} store
 * @param {{ id?: string }} [options] The router entity, `router` by default.
 * @returns {() => Promise<void>} Stops listening.
 *
 * @example
 * watchAppLinks(App, store)
 */
export function watchAppLinks(app, store, { id = DEFAULT_ID } = {}) {
  if (!isNative()) return async () => {}

  openLaunchUrl()
  const listener = app.addListener(URL_OPEN_EVENT, ({ url }) => open(url))

  return async function stop() {
    const handle = await listener
    await handle.remove()
  }

  async function openLaunchUrl() {
    try {
      const launch = await app.getLaunchUrl()
      if (launch?.url) open(launch.url)
    } catch {
      // No launch URL to read is the same as none.
    }
  }

  function open(url) {
    const path = toPath(url)
    if (path) store.notify(`#${id}:navigate`, path)
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
