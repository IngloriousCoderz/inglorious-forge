import { isNative } from "../native/index.js"
import { applyPwaUpdate, watchPwaUpdate } from "./update.js"

export { applyPwaUpdate } from "./update.js"

const ONE_HOUR_MS = 3_600_000

/**
 * The type that keeps an installed PWA on its latest version. Updates are not
 * optional: a downloaded version is applied on its own wherever nobody is
 * mid-task, at boot, before anything is touched, and each time the app leaves
 * or comes back to the foreground. A version that lands while someone is using
 * the app only sets `isUpdateReady`, so the app can offer to move over at once
 * with `pwaUpdateApply`; the next trip to the background moves over regardless.
 *
 * It checks for a new version every `checkEveryMs` and on each return to the
 * foreground: a phone suspends an installed PWA rather than closing it, so the
 * browser's own check on navigation may never come. It works with the service
 * worker that `vite-plugin-pwa` generates, registered with `registerType:
 * "prompt"`, and does nothing in a native app or without a service worker.
 *
 * @param {Object} [config]
 * @param {number} [config.checkEveryMs] Defaults to one hour.
 *
 * @example
 * registerSW() // from "virtual:pwa-register"
 * const types = { PwaUpdate: createPwaUpdate() }
 * const entities = { pwaUpdate: { type: "PwaUpdate" } }
 */
export function createPwaUpdate({ checkEveryMs = ONE_HOUR_MS } = {}) {
  const watches = new Map()

  return {
    create(entity, _, api) {
      entity.isUpdateReady ??= false
      const serviceWorker = globalThis.navigator?.serviceWorker
      if (isNative() || !serviceWorker) return

      const { id } = entity
      watches.get(id)?.()
      let isStopped = false
      watches.set(id, () => {
        isStopped = true
      })
      serviceWorker.ready.then((registration) => {
        if (isStopped) return
        const stop = watchPwaUpdate(
          registration,
          () => api.notify(`#${id}:pwaUpdateReady`),
          { checkEveryMs },
        )
        watches.set(id, stop)
      })
    },

    destroy(entity) {
      watches.get(entity.id)?.()
      watches.delete(entity.id)
    },

    pwaUpdateReady(entity) {
      entity.isUpdateReady = true
    },

    pwaUpdateApply() {
      applyPwaUpdate()
    },
  }
}
