import { handleAsync } from "@inglorious/store/async"

const DEFAULT_DECLINE_KEY = "inglorious-push-declined"

// The adapters whose taps are already wired: an entity created again (a hot
// update, a second store) must not open each push twice.
const tappedAdapters = new WeakSet()

/**
 * The type that asks a device for push notifications and keeps it registered.
 *
 * A device shows its permission dialog only so many times, and a refusal
 * there may be for good. So the type asks in the app's own words first: an
 * entity with `isOpen` the app renders as a prompt, whose yes brings up the
 * system's dialog (`pushAsk`) and whose no (`pushDecline`) is remembered on
 * the device, so it never asks again. Allowed later from the system's
 * settings, pushes still register.
 *
 * The app tells it when there is someone to register for: `pushStart` (at
 * sign-in) checks the permission, registers the device if it is granted, and
 * otherwise opens the prompt; `pushStop` (at sign-out) closes it. Map them
 * onto the app's own events, such as `sessionStart: type.pushStart`.
 *
 * Everything vendor-specific is the `adapter`'s:
 *
 * - `isSupported()`: whether this device can receive pushes at all.
 * - `permission()`: `"granted"`, `"denied"` or `"prompt"`.
 * - `request()`: brings up the system's dialog, resolving to the same. In a
 *   browser it must call `Notification.requestPermission()` before it awaits
 *   anything, since the dialog needs the tap that asked.
 * - `register()`: gets the device's token and stores it for the signed-in
 *   user. Unregistering is the app's to do at sign-out, while the user can
 *   still delete their own token.
 * - `onTap(listener)`, optional: calls `listener(url)` when a push is tapped,
 *   where the system shows them itself (native apps). The type navigates
 *   there with `onTap(url, api)`, by default `#router:navigate`.
 *
 * @param {Object} config
 * @param {Object} config.adapter
 * @param {string} [config.declineKey] - The localStorage key of a decline.
 * @param {(url: string, api: Object) => void} [config.onTap]
 *
 * @example
 * const prompt = createPushPrompt({ adapter: fcm })
 * const types = {
 *   PushPrompt: {
 *     ...prompt,
 *     ...renderers,
 *     sessionStart: prompt.pushStart,
 *     sessionEnd: prompt.pushStop,
 *   },
 * }
 */
export function createPushPrompt({
  adapter,
  declineKey = DEFAULT_DECLINE_KEY,
  onTap = navigate,
}) {
  function isDeclined() {
    try {
      return window.localStorage.getItem(declineKey) !== null
    } catch {
      return false
    }
  }

  return {
    create(entity, _, api) {
      entity.isOpen ??= false
      entity.isActive ??= false
      if (adapter.onTap && !tappedAdapters.has(adapter)) {
        tappedAdapters.add(adapter)
        adapter.onTap((url) => onTap(url, api))
      }
    },

    pushStart(entity, _, api) {
      entity.isActive = true
      api.notify(`#${entity.id}:pushCheck`)
    },

    pushStop(entity) {
      entity.isActive = false
      entity.isOpen = false
    },

    // Asking the device is async, so a stop can land before the answer: the
    // prompt only opens while started.
    ...handleAsync("pushCheck", {
      async run() {
        if (!(await adapter.isSupported())) return null
        return adapter.permission()
      },
      success(entity, permission, api) {
        if (!entity.isActive) return
        if (permission === "granted") {
          api.notify(`#${entity.id}:pushRegister`)
          return
        }
        entity.isOpen = permission === "prompt" && !isDeclined()
      },
      error() {},
    }),

    // The prompt goes down as the system's dialog comes up. Dismissing the
    // dialog leaves the permission undecided, so the next start asks again.
    ...handleAsync("pushAsk", {
      start(entity) {
        entity.isOpen = false
      },
      run() {
        return adapter.request()
      },
      success(entity, permission, api) {
        if (permission === "granted") api.notify(`#${entity.id}:pushRegister`)
      },
      error() {},
    }),

    pushDecline(entity) {
      try {
        window.localStorage.setItem(declineKey, "true")
      } catch {
        // Without storage the prompt comes back next start, nothing worse.
      }
      entity.isOpen = false
    },

    // Nothing on screen depends on it: a device that fails to register now
    // tries again at the next start.
    ...handleAsync("pushRegister", {
      run() {
        return adapter.register()
      },
      error() {},
    }),
  }
}

function navigate(url, api) {
  api.notify("#router:navigate", url)
}
