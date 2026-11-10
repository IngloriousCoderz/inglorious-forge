import { isNative } from "../mobile/index.js"

const DEFAULT_ROOT_PATHS = ["/"]
const BACK_BUTTON_EVENT = "backButton"

/**
 * Android's back button and back gesture, as other Android apps have them:
 * they go back in history, and close the app on a root path or when there is
 * no history left. Root paths are the top-level pages, like a tab bar's: going
 * back from one leaves the app at once. Does nothing outside a native app, and
 * iOS sends no back button.
 *
 * @param {Object} app `App` from `@capacitor/app`.
 * @param {{ rootPaths?: string[] }} [options] `["/"]` by default.
 * @returns {() => Promise<void>} Stops listening.
 *
 * @example
 * watchBackButton(App, { rootPaths: ["/", "/search", "/profile"] })
 */
export function watchBackButton(app, { rootPaths = DEFAULT_ROOT_PATHS } = {}) {
  if (!isNative()) return async () => {}

  const listener = app.addListener(BACK_BUTTON_EVENT, ({ canGoBack }) => {
    if (canGoBack && !rootPaths.includes(window.location.pathname)) {
      window.history.back()
    } else {
      app.exitApp()
    }
  })

  return async function stop() {
    const handle = await listener
    await handle.remove()
  }
}
