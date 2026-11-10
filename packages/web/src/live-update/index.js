import { isNative } from "../mobile/index.js"

const DEFAULT_ID = "liveUpdate"
const ONE_HOUR_MS = 3_600_000
const NO_MIN_BUILD = 0
const RESUME_EVENT = "resume"
const PAUSE_EVENT = "pause"

/**
 * The type that offers a downloaded live update. A native app carries its web
 * code inside the binary; a live update replaces that code without the
 * stores, and `watchLiveUpdate` announces one that is ready as
 * `#${id}:liveUpdateReady`. `liveUpdateApply` moves over to it at once.
 *
 * @param {{ plugin: { reload(): Promise<void> } }} config `LiveUpdate` from
 *   `@capawesome/capacitor-live-update`.
 */
export function createLiveUpdate({ plugin }) {
  return {
    create(entity) {
      entity.isUpdateReady ??= false
    },

    liveUpdateReady(entity) {
      entity.isUpdateReady = true
    },

    liveUpdateApply() {
      plugin.reload()
    },
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

/**
 * Keeps a native app on its latest published web code. Confirms at once that
 * the running bundle works, so the plugin doesn't roll it back. Then, at launch,
 * every `checkEveryMs` and on each return to the foreground, reads the
 * manifest at `manifestUrl` and downloads a bundle that is wanted
 * (`isLiveUpdateWanted`) and not blocked by an earlier rollback. A downloaded
 * bundle is applied the next time the app goes to the background, and
 * announced as `#${id}:liveUpdateReady` meanwhile. Does nothing outside a
 * native app.
 *
 * @param {Object} options
 * @param {Object} options.plugin `LiveUpdate` from
 *   `@capawesome/capacitor-live-update`.
 * @param {Object} options.app `App` from `@capacitor/app`.
 * @param {{ notify: (type: string, payload?: unknown) => void }} [options.store]
 * @param {string} options.manifestUrl
 * @param {number} options.release The release of the running web code.
 * @param {string} [options.id]
 * @param {number} [options.checkEveryMs]
 * @returns {() => Promise<void>} Stops watching.
 */
export function watchLiveUpdate({
  plugin,
  app,
  store,
  manifestUrl,
  release,
  id = DEFAULT_ID,
  checkEveryMs = ONE_HOUR_MS,
}) {
  if (!isNative()) return async () => {}

  let pending = null
  let isChecking = false

  plugin.ready().catch(() => {})
  check()
  const interval = setInterval(check, checkEveryMs)
  const listeners = [
    app.addListener(RESUME_EVENT, check),
    app.addListener(PAUSE_EVENT, apply),
  ]

  return async function stop() {
    clearInterval(interval)
    for (const listener of listeners) {
      const handle = await listener
      await handle.remove()
    }
  }

  function apply() {
    if (pending !== null) plugin.reload().catch(() => {})
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
      if (pending === manifest.release) return
      await prepare(manifest)
      pending = manifest.release
      store?.notify(`#${id}:liveUpdateReady`)
    } catch {
      // Offline, or a bundle that fails its checks: the running code stays.
    } finally {
      isChecking = false
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
