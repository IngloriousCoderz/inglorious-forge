import { isNative } from "../index.js"

const LIGHT_CONTENT = "DARK"
const DARK_CONTENT = "LIGHT"
const DEVICE = "DEFAULT"
const DARK_QUERY = "(prefers-color-scheme: dark)"
const WATCHED_ATTRIBUTES = ["class", "style", "data-theme"]

/**
 * The type that keeps the status bar and navigation bar readable on the app's
 * own colours. The bars follow the device's light or dark mode, so a light-only
 * app on a phone in dark mode gets white icons on a white page. This reads the
 * app's `color-scheme` instead, which every Inglorious UI theme sets, and
 * follows it when a theme class changes. The entity's `style` is the bars'
 * current style. An app that follows the device keeps the device's style. Does
 * nothing outside a native app.
 *
 * @param {Object} config
 * @param {Object} config.plugin `SystemBars` from `@capacitor/core`.
 *
 * @example
 * import { SystemBars } from "@capacitor/core"
 * const types = { SystemBars: createSystemBars({ plugin: SystemBars }) }
 * const entities = { systemBars: { type: "SystemBars" } }
 */
export function createSystemBars({ plugin }) {
  const watches = new Map()

  return {
    create(entity, _, api) {
      entity.style ??= null
      if (!isNative()) return

      const { id } = entity
      watches.get(id)?.()
      watches.set(
        id,
        watch((style) => api.notify(`#${id}:systemBarsStyleChange`, style)),
      )
    },

    destroy(entity) {
      watches.get(entity.id)?.()
      watches.delete(entity.id)
    },

    systemBarsStyleChange(entity, style) {
      if (entity.style === style) return
      entity.style = style
      plugin.setStyle({ style })
    },
  }
}

/**
 * The bars' style for a `color-scheme` value: light content on a dark-only
 * page, dark content on a light-only one, the device's otherwise.
 *
 * @param {string} colorScheme
 * @returns {"DARK" | "LIGHT" | "DEFAULT"}
 */
export function styleFor(colorScheme) {
  const schemes = colorScheme.split(/\s+/)
  const isDark = schemes.includes("dark")
  const isLight = schemes.includes("light")

  if (isDark && !isLight) return LIGHT_CONTENT
  if (isLight && !isDark) return DARK_CONTENT
  return DEVICE
}

/**
 * Follows the app's `color-scheme`, calling `onChange` with the bars' style
 * now and whenever a theme class or the device's mode changes.
 * @param {(style: string) => void} onChange
 * @returns {() => void} Stops following.
 */
function watch(onChange) {
  const update = () => onChange(styleFor(appColorScheme()))

  update()

  const observer = new MutationObserver(update)
  for (const element of [document.documentElement, document.body]) {
    if (element) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: WATCHED_ATTRIBUTES,
      })
    }
  }
  const media = window.matchMedia?.(DARK_QUERY)
  media?.addEventListener("change", update)

  return function stop() {
    observer.disconnect()
    media?.removeEventListener("change", update)
  }
}

function appColorScheme() {
  const element = document.body ?? document.documentElement
  return getComputedStyle(element).colorScheme ?? ""
}
