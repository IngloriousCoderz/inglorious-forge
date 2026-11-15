import { handleAsync } from "@inglorious/store/async"

import { isNative } from "../index.js"

const RESUME_EVENT = "resume"

/**
 * The type that blocks a native build older than the minimum allowed. A
 * native app carries its web code inside the binary, so only the stores can
 * update it: the app reads a minimum build per platform, and a build below it
 * sets `isUpdateRequired`, which the app renders as a page with nothing but
 * a way to the store (`nativeUpdateApply`, opening `storeUrl`).
 *
 * Given `App` from `@capacitor/app` as `plugin`, it checks the installed build
 * at launch and each time the app comes back to the foreground; otherwise the
 * app sends `nativeUpdateCheck({ platform, build })` itself. A failed check
 * keeps the last answer: the gate never closes or opens on a guess. Does
 * nothing outside a native app.
 *
 * The `adapter` says where the minimum lives: `requirement(platform)`
 * resolves to `{ minBuild, storeUrl }`, or `null` for no minimum.
 *
 * @param {Object} config
 * @param {Object} config.adapter
 * @param {Object} [config.plugin] `App` from `@capacitor/app`.
 *
 * @example
 * import { App } from "@capacitor/app"
 * const types = {
 *   NativeUpdate: [createNativeUpdate({ adapter, plugin: App }), template],
 * }
 * const entities = { nativeUpdate: { type: "NativeUpdate" } }
 */
export function createNativeUpdate({ adapter, plugin }) {
  const listeners = new Map()

  return {
    create(entity, _, api) {
      entity.isUpdateRequired ??= false
      entity.storeUrl ??= null
      if (!plugin || !isNative()) return

      const { id } = entity
      const check = () => checkBuild(plugin, id, api)

      check()
      listeners.set(id, plugin.addListener(RESUME_EVENT, check))
    },

    destroy(entity) {
      const listener = listeners.get(entity.id)
      listeners.delete(entity.id)
      listener?.then((handle) => handle.remove())
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

async function checkBuild(plugin, id, api) {
  try {
    const { build } = await plugin.getInfo()
    api.notify(`#${id}:nativeUpdateCheck`, {
      platform: globalThis.Capacitor.getPlatform(),
      build: Number(build),
    })
  } catch {
    // An unreadable build is no reason to block anyone.
  }
}

function isOutdated(build, requirement) {
  if (!requirement || !Number.isFinite(build)) return false
  return build < requirement.minBuild
}
