import i18next from "i18next"

import { parseTrans } from "./trans.js"

/**
 * @typedef {import('../types').I18nOptions} I18nOptions
 * @typedef {import('../types').I18n} I18n
 */

/**
 * Creates an i18next instance and the Inglorious type that drives it.
 *
 * The locale lives in a store entity, so changing language is an ordinary
 * event: the handler switches i18next and updates the entity, and the render
 * that follows reads every string in the new language. With the catalogues
 * passed in `resources`, i18next initialises and switches synchronously, so
 * nothing has to wait for a promise.
 *
 * @param {I18nOptions} options
 * @returns {I18n}
 */
export function createI18n({
  resources,
  locales = Object.keys(resources ?? {}),
  defaultLocale,
  storageKey,
  i18nextOptions = {},
}) {
  const [firstLocale = "en"] = locales
  const fallbackLocale = defaultLocale ?? firstLocale
  const instance = i18next.createInstance()
  instance.init({
    ...i18nextOptions,
    resources,
    lng: detectLocale({ locales, defaultLocale: fallbackLocale, storageKey }),
    fallbackLng: fallbackLocale,
    supportedLngs: locales,
    // lit-html escapes every text binding already; escaping here too would
    // print entities such as &amp; on screen.
    interpolation: { escapeValue: false, ...i18nextOptions.interpolation },
    initAsync: false,
  })

  const I18n = {
    create(entity) {
      entity.locale = instance.language
      entity.locales = locales
      applyDocumentLanguage(entity.locale)
    },

    localeChange(entity, locale) {
      if (!locales.includes(locale) || locale === entity.locale) return
      instance.changeLanguage(locale)
      entity.locale = locale
      saveLocale(storageKey, locale)
      applyDocumentLanguage(locale)
    },
  }

  /**
   * Translates `key` into template parts, with the tags the translation
   * contains rendered by `components`: `"Logging in as <strong>{{email}}</strong>."`
   * with `{ strong: (children) => html`<strong>${children}</strong>` }`.
   * Values fill the text between tags and stay text, so they cannot inject
   * markup; tags without a component show as written.
   */
  function trans(key, { values = {}, components = {} } = {}) {
    const raw = instance.t(key, { ...values, skipInterpolation: true })
    const interpolationOptions = {
      interpolation: { ...instance.options.interpolation, escapeValue: false },
    }
    return parseTrans(raw, components, (text) =>
      instance.services.interpolator.interpolate(
        text,
        values,
        instance.language,
        interpolationOptions,
      ),
    )
  }

  return {
    I18n,
    t: (key, options) => instance.t(key, options),
    trans,
    i18next: instance,
  }
}

/**
 * The locale to start with: the one saved by a previous choice, else the
 * first of the device's languages that is supported (exactly, or by its base
 * language, so `it-CH` picks `it`), else the default.
 *
 * @param {{ locales: string[], defaultLocale: string, storageKey?: string }} options
 * @returns {string}
 */
export function detectLocale({ locales, defaultLocale, storageKey }) {
  const saved = readLocale(storageKey)
  if (saved && locales.includes(saved)) return saved

  const preferred =
    typeof navigator === "undefined"
      ? []
      : (navigator.languages ?? [navigator.language])
  for (const language of preferred.filter(Boolean)) {
    if (locales.includes(language)) return language
    const [base] = language.split("-")
    if (locales.includes(base)) return base
  }

  return defaultLocale
}

function readLocale(storageKey) {
  if (!storageKey) return null
  try {
    return globalThis.localStorage?.getItem(storageKey) ?? null
  } catch {
    // Storage can be unavailable (private mode, server rendering): fall back
    // to detection rather than failing.
    return null
  }
}

function saveLocale(storageKey, locale) {
  if (!storageKey) return
  try {
    globalThis.localStorage?.setItem(storageKey, locale)
  } catch {
    // Not persisting the choice is better than breaking the switch.
  }
}

// Screen readers, hyphenation and the browser's own spell checking read the
// document language, so it follows the app's.
function applyDocumentLanguage(locale) {
  if (typeof document === "undefined") return
  document.documentElement.lang = locale
}
