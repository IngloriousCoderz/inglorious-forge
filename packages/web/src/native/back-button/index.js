import { isNative } from "../index.js"

const DEFAULT_ROOT_PATHS = ["/"]
const BACK_BUTTON_EVENT = "backButton"

/**
 * The type behind Android's back button and back gesture, as other Android
 * apps have them: they go back in history, and close the app on a root path or
 * when there is no history left. The entity's `rootPaths` are the top-level
 * pages, like a tab bar's: going back from one leaves the app at once. Does
 * nothing outside a native app, and iOS sends no back button.
 *
 * @param {Object} config
 * @param {Object} config.plugin `App` from `@capacitor/app`.
 *
 * @example
 * import { App } from "@capacitor/app"
 * const types = { BackButton: createBackButton({ plugin: App }) }
 * const entities = {
 *   backButton: { type: "BackButton", rootPaths: ["/", "/search", "/profile"] },
 * }
 */
export function createBackButton({ plugin }) {
  const listeners = new Map()

  return {
    create(entity, _, api) {
      entity.rootPaths ??= DEFAULT_ROOT_PATHS
      if (!isNative()) return

      const { id } = entity
      listeners.set(
        id,
        plugin.addListener(BACK_BUTTON_EVENT, ({ canGoBack }) =>
          api.notify(`#${id}:backButtonPress`, { canGoBack }),
        ),
      )
    },

    destroy(entity) {
      const listener = listeners.get(entity.id)
      listeners.delete(entity.id)
      listener?.then((handle) => handle.remove())
    },

    backButtonPress(entity, { canGoBack }) {
      if (canGoBack && !entity.rootPaths.includes(window.location.pathname)) {
        window.history.back()
      } else {
        plugin.exitApp()
      }
    },
  }
}
