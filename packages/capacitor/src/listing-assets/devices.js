/**
 * Store screenshot sizes, as a viewport in CSS pixels and a pixel ratio whose
 * product is the size the store asks for.
 */
export const DEVICES = {
  "iphone-6.9": { viewport: { width: 440, height: 956 }, scale: 3 },
  "iphone-6.3": { viewport: { width: 402, height: 874 }, scale: 3 },
  "ipad-13": { viewport: { width: 1032, height: 1376 }, scale: 2 },
  android: { viewport: { width: 360, height: 640 }, scale: 3 },
  "tablet-7": { viewport: { width: 540, height: 960 }, scale: 2 },
  "tablet-10": { viewport: { width: 720, height: 1280 }, scale: 2 },
}

export const DEFAULT_DEVICES = ["iphone-6.9", "android"]

/**
 * @param {string[]} names
 * @returns {[string, typeof DEVICES[keyof typeof DEVICES]][]}
 */
export function resolveDevices(names = DEFAULT_DEVICES) {
  const unknown = names.filter((name) => !(name in DEVICES))
  if (unknown.length) {
    throw new Error(
      `Unknown devices: ${unknown.join(", ")}. Choose from ${Object.keys(DEVICES).join(", ")}`,
    )
  }
  return names.map((name) => [name, DEVICES[name]])
}

/**
 * The address of a screen in a locale: `localeParam` added to the path's own
 * query, if the app reads the locale from links.
 *
 * @param {string} base
 * @param {string} screenPath
 * @param {{ locale?: string, localeParam?: string }} [options]
 */
export function screenUrl(base, screenPath, { locale, localeParam } = {}) {
  const url = new URL(screenPath, base)
  if (locale && localeParam) url.searchParams.set(localeParam, locale)
  return url.href
}
