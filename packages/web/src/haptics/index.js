const IMPACTS = { light: "LIGHT", medium: "MEDIUM", heavy: "HEAVY" }
const NOTIFICATIONS = { success: "SUCCESS", warning: "WARNING", error: "ERROR" }
const LIGHT_MS = 20
const MEDIUM_MS = 40
const HEAVY_MS = 70
const PAUSE_MS = 80
const VIBRATIONS = {
  light: [LIGHT_MS],
  medium: [MEDIUM_MS],
  heavy: [HEAVY_MS],
  success: [LIGHT_MS, PAUSE_MS, LIGHT_MS],
  warning: [MEDIUM_MS, PAUSE_MS, MEDIUM_MS],
  error: [HEAVY_MS, PAUSE_MS, HEAVY_MS, PAUSE_MS, HEAVY_MS],
}

let plugin = null

/**
 * Taps the user can feel, as native apps give on a toggle or a refresh. In a
 * native app it plays the system's own haptics through `Haptics` from
 * `@capacitor/haptics`, once handed over with `haptics.use`. Elsewhere it
 * vibrates where the browser can (Chrome on Android); iOS browsers stay
 * silent, and Chrome only vibrates once the user has tapped the page. Every
 * call returns whether it played. Inglorious UI plays them too, such as
 * `PullToRefresh` when letting go would refresh.
 *
 * @example
 * import { Haptics } from "@capacitor/haptics"
 * import { haptics } from "@inglorious/web/haptics"
 *
 * haptics.use(Haptics)
 * haptics.notification("success")
 */
export const haptics = {
  /**
   * Plays the system's haptics in a native app.
   * @param {Object | null} haptics `Haptics` from `@capacitor/haptics`.
   */
  use(haptics) {
    plugin = haptics
  },

  /**
   * A choice changed, such as a toggle flipped or a threshold crossed.
   * @returns {boolean} Whether it played.
   */
  selection() {
    return play("light", () => plugin.impact({ style: IMPACTS.light }))
  },

  /**
   * Something hit, harder the heavier the style.
   * @param {"light" | "medium" | "heavy"} [style]
   * @returns {boolean} Whether it played.
   */
  impact(style = "medium") {
    return play(style, () => plugin.impact({ style: IMPACTS[style] }))
  },

  /**
   * The outcome of an action.
   * @param {"success" | "warning" | "error"} [type]
   * @returns {boolean} Whether it played.
   */
  notification(type = "success") {
    return play(type, () => plugin.notification({ type: NOTIFICATIONS[type] }))
  },
}

function play(kind, native) {
  if (plugin) {
    Promise.resolve()
      .then(native)
      .catch(() => {})
    return true
  }
  return globalThis.navigator?.vibrate?.(VIBRATIONS[kind]) ?? false
}
