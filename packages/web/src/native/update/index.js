import { handleAsync } from "@inglorious/store/async"

import { isNative } from "../index.js"

const DEFAULT_ID = "nativeUpdate"
const RESUME_EVENT = "resume"

/**
 * The type that blocks a native build older than the minimum allowed. A
 * native app carries its web code inside the binary, so only the stores can
 * update it: the app reads a minimum build per platform, and a build below it
 * sets `isUpdateRequired`, which the app renders as a page with nothing but
 * a way to the store (`nativeUpdateApply`, opening `storeUrl`).
 *
 * A failed check keeps the last answer: the gate never closes or opens on a
 * guess.
 *
 * The `adapter` says where the minimum lives: `requirement(platform)`
 * resolves to `{ minBuild, storeUrl }`, or `null` for no minimum.
 *
 * @param {Object} config
 * @param {Object} config.adapter
 *
 * @example
 * const types = { NativeUpdate: [createNativeUpdate({ adapter }), template] }
 * watchNativeUpdate(App, store)
 */
export function createNativeUpdate({ adapter }) {
  return {
    create(entity) {
      entity.isUpdateRequired ??= false
      entity.storeUrl ??= null
    },

    ...handleAsync("nativeUpdateCheck", {
      async run({ platform, build }) {
        return { build, requirement: await adapter.requirement(platform) }
      },
      success(entity, { build, requirement }) {
        entity.isUpdateRequired = isOutdated(build, requirement)
        entity.storeUrl = requirement?.storeUrl ?? null
      },
      error() {},
    }),

    nativeUpdateApply(entity) {
      if (entity.storeUrl) window.location.assign(entity.storeUrl)
    },
  }
}

/**
 * Checks the installed build at launch and each time the app comes back to
 * the foreground, notifying `#${id}:nativeUpdateCheck`. Does nothing outside
 * a native app.
 *
 * @param {Object} app `App` from `@capacitor/app`.
 * @param {{ notify: (type: string, payload?: unknown) => void }} store
 * @param {{ id?: string }} [options]
 * @returns {() => Promise<void>} Stops watching.
 */
export function watchNativeUpdate(app, store, { id = DEFAULT_ID } = {}) {
  if (!isNative()) return async () => {}

  check()
  const listener = app.addListener(RESUME_EVENT, check)

  return async function stop() {
    const handle = await listener
    await handle.remove()
  }

  async function check() {
    try {
      const { build } = await app.getInfo()
      store.notify(`#${id}:nativeUpdateCheck`, {
        platform: globalThis.Capacitor.getPlatform(),
        build: Number(build),
      })
    } catch {
      // An unreadable build is no reason to block anyone.
    }
  }
}

function isOutdated(build, requirement) {
  if (!requirement || !Number.isFinite(build)) return false
  return build < requirement.minBuild
}
