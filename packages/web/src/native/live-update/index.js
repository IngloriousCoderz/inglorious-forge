import { isNative } from "../index.js"

const ONE_HOUR_MS = 3_600_000
const NO_MIN_BUILD = 0
const RESUME_EVENT = "resume"
const PAUSE_EVENT = "pause"

/**
 * The type that keeps a native app on its latest published web code. A native
 * app carries its web code inside the binary; a live update replaces that code
 * without the stores, through `LiveUpdate` from
 * `@capawesome/capacitor-live-update`.
 *
 * Once created, it confirms that the running bundle works, so the plugin
 * doesn't roll it back. Then, at launch, every `checkEveryMs` and on each
 * return to the foreground, it reads the manifest at `manifestUrl` and
 * downloads a bundle that is wanted (`isLiveUpdateWanted`) and not blocked by
 * an earlier rollback. A downloaded bundle sets `isUpdateReady` and
 * `pendingRelease`, is applied the next time the app goes to the background,
 * and `liveUpdateApply` moves over to it at once. Does nothing outside a
 * native app, and without `manifestUrl` or `release`: a development build
 * must not update itself.
 *
 * @param {Object} config
 * @param {Object} config.plugin `LiveUpdate` from `@capawesome/capacitor-live-update`.
 * @param {Object} [config.app] `App` from `@capacitor/app`.
 * @param {string} [config.manifestUrl]
 * @param {number} [config.release] The release of the running web code.
 * @param {number} [config.checkEveryMs]
 *
 * @example
 * const types = {
 *   LiveUpdate: createLiveUpdate({
 *     plugin: LiveUpdate,
 *     app: App,
 *     manifestUrl,
 *     release: Number(import.meta.env.VITE_LIVE_UPDATE_RELEASE),
 *   }),
 * }
 * const entities = { liveUpdate: { type: "LiveUpdate" } }
 */
export function createLiveUpdate({
  plugin,
  app,
  manifestUrl,
  release,
  checkEveryMs = ONE_HOUR_MS,
}) {
  const watches = new Map()

  return {
    create(entity, _, api) {
      entity.isUpdateReady ??= false
      entity.pendingRelease ??= null
      if (!isNative() || !app || !manifestUrl || !release) return

      const { id } = entity
      watches.get(id)?.()
      watches.set(id, watch(id, api))
    },

    destroy(entity) {
      watches.get(entity.id)?.()
      watches.delete(entity.id)
    },

    liveUpdateReady(entity, pendingRelease) {
      entity.isUpdateReady = true
      entity.pendingRelease = pendingRelease
    },

    liveUpdateApply() {
      plugin.reload()
    },
  }

  function watch(id, api) {
    let isChecking = false

    plugin.ready().catch(() => {})
    check()
    const interval = setInterval(check, checkEveryMs)
    const listeners = [
      app.addListener(RESUME_EVENT, check),
      app.addListener(PAUSE_EVENT, apply),
    ]

    return function stop() {
      clearInterval(interval)
      for (const listener of listeners) {
        listener.then((handle) => handle.remove())
      }
    }

    function apply() {
      if (api.getEntity(id)?.pendingRelease != null) {
        plugin.reload().catch(() => {})
      }
    }

    async function check() {
      if (isChecking) return
      isChecking = true
      try {
        const manifest = await latest()
        const { build } = await app.getInfo()
        if (!isLiveUpdateWanted(manifest, { release, build: Number(build) })) {
          return
        }
        if (api.getEntity(id)?.pendingRelease === manifest.release) return
        await prepare(manifest)
        api.notify(`#${id}:liveUpdateReady`, manifest.release)
      } catch {
        // Offline, or a bundle that fails its checks: the running code stays.
      } finally {
        isChecking = false
      }
    }
  }

  async function latest() {
    const response = await fetch(manifestUrl, { cache: "no-store" })
    if (!response.ok) throw new Error(`Manifest: ${response.status}`)
    return response.json()
  }

  async function prepare({ release: next, url, checksum, signature }) {
    const bundleId = String(next)
    const { bundleIds: blocked } = await plugin.getBlockedBundles()
    if (blocked.includes(bundleId)) throw new Error("Rolled back before")
    const { bundleIds: downloaded } = await plugin.getDownloadedBundles()
    if (!downloaded.includes(bundleId)) {
      await plugin.downloadBundle({ url, bundleId, checksum, signature })
    }
    await plugin.setNextBundle({ bundleId })
  }
}

/**
 * Whether a published bundle should replace the running one: it must be newer
 * than what runs, and the installed build must be one it was made for.
 *
 * @param {{ release: number, minBuild?: number } | null} manifest
 * @param {{ release: number, build: number }} installed
 */
export function isLiveUpdateWanted(manifest, { release, build }) {
  return (
    Number.isFinite(manifest?.release) &&
    manifest.release > release &&
    build >= (manifest.minBuild ?? NO_MIN_BUILD)
  )
}
