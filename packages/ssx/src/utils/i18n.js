export function getLocaleFromPath(
  pathname,
  { defaultLocale = "en", locales = [] } = {},
) {
  const [pathOnly] = pathname.split("?")
  const [cleanPath] = pathOnly.split("#")
  const first = cleanPath.split("/").filter(Boolean)[0]

  if (first && locales.includes(first)) return first
  return defaultLocale
}

// Scripts written right to left, by their ISO 15924 code.
const RTL_SCRIPTS = new Set([
  "Adlm",
  "Arab",
  "Hebr",
  "Mand",
  "Nkoo",
  "Rohg",
  "Samr",
  "Syrc",
  "Thaa",
  "Yezi",
])

/**
 * The direction a language is written in, for the `dir` of `<html>`. The script comes
 * from the locale itself (`az-Arab`) or, when it names none, the likeliest one (`ar` is
 * written in Arabic script).
 *
 * @param {string} [locale] - A BCP 47 language tag, such as `ar` or `en-US`.
 * @returns {"ltr" | "rtl"} The text direction.
 */
export function getTextDirection(locale) {
  if (!locale) return "ltr"

  try {
    const { script } = new Intl.Locale(locale).maximize()
    return RTL_SCRIPTS.has(script) ? "rtl" : "ltr"
  } catch {
    // Not a valid language tag.
    return "ltr"
  }
}

// The entity of an app that translates with @inglorious/i18n, by that package's convention.
const TRANSLATOR_ID = "i18n"

/**
 * Switches the app's @inglorious/i18n entity, if it has one, to `locale`. Immediate when
 * the locale's catalogue is loaded, as `waitForLocale` makes sure of: call it right before
 * rendering, so that every translation in the render is in that locale even when renders
 * for other locales share the same i18next instance.
 *
 * @param {Object} store - The application store.
 * @param {string} [locale] - The locale of the page.
 */
export function selectLocale(store, locale) {
  if (!locale || !hasTranslator(store)) return
  store.notify(`#${TRANSLATOR_ID}:localeChange`, locale)
}

/**
 * Switches the app's @inglorious/i18n entity, if it has one, to `locale`, and resolves
 * once its catalogue has loaded, or failed to. Without such an entity it resolves at once.
 *
 * @param {Object} store - The application store.
 * @param {string} [locale] - The locale of the page.
 * @returns {Promise<void>}
 */
export function waitForLocale(store, locale) {
  if (!locale || !hasTranslator(store)) return Promise.resolve()

  store.notify(`#${TRANSLATOR_ID}:localeChange`, locale)

  return new Promise((resolve) => {
    let unsubscribe = null
    const isLoaded = () => !store._api.getEntity(TRANSLATOR_ID).loadingLocale
    if (isLoaded()) return resolve()

    unsubscribe = store.subscribe(() => {
      if (!isLoaded()) return
      unsubscribe()
      resolve()
    })
  })
}

function hasTranslator(store) {
  const translator = store._api.getEntity(TRANSLATOR_ID)
  return Boolean(
    translator && store._api.getType(translator.type)?.localeChange,
  )
}
