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
 * that follows reads every string in the new language.
 *
 * Catalogues come in `catalogues`, typically straight from Vite:
 * `import.meta.glob("./locales/*.json")`. Each file is a locale named after
 * it, loaded only when needed; the starting locale and the fallback are loaded
 * before `ready` resolves, so mount after it and the first render is already
 * translated. A change to a locale not loaded yet loads it first and switches
 * when it arrives; `entity.loadingLocale` names it meanwhile. `resources` and
 * `loadLocale` are the lower-level way to the same, and catalogues passed in
 * `resources` are bundled and switch synchronously.
 *
 * With `saveUserLocale`, the language also follows the signed-in user: see
 * `userLocaleLoad` below.
 *
 * @param {I18nOptions} options
 * @returns {I18n}
 */
export function createI18n({
  catalogues,
  resources: givenResources = {},
  loadLocale: givenLoadLocale,
  locales: givenLocales,
  isServerRendered = false,
  defaultLocale,
  storageKey,
  saveUserLocale,
  i18nextOptions = {},
}) {
  const { resources, loadLocale, cataloguedLocales } = fromCatalogues(
    catalogues,
    givenResources,
    givenLoadLocale,
  )
  const locales = givenLocales ?? [
    ...new Set([...Object.keys(resources), ...cataloguedLocales]),
  ]
  const [firstLocale = "en"] = locales
  const fallbackLocale = defaultLocale ?? firstLocale
  // A server-rendered page is already in a language, which hydration must keep.
  // In a page served as is, `<html lang>` is whatever the file says, so it is
  // detected instead.
  const startLocale =
    (isServerRendered && matchLocale(getDocumentLanguage(), locales)) ||
    detectLocale({ locales, defaultLocale: fallbackLocale, storageKey })
  const languages = locales.map((locale) => ({
    value: locale,
    label: languageName(locale),
  }))

  const instance = i18next.createInstance()
  instance.init({
    ...i18nextOptions,
    resources,
    partialBundledLanguages: true,
    lng: startLocale,
    fallbackLng: fallbackLocale,
    supportedLngs: locales,
    interpolation: { escapeValue: false, ...i18nextOptions.interpolation },
    initAsync: false,
  })

  const loader = createLoader(instance, resources, loadLocale)

  const ready = Promise.all(
    [...new Set([startLocale, fallbackLocale])].map((locale) =>
      loader.load(locale).catch((error) => {
        console.warn(`[i18n] could not load "${locale}":`, error)
      }),
    ),
  ).then(() => {})

  const I18n = {
    create(entity) {
      entity.locale = instance.language
      entity.dir = instance.dir(entity.locale)
      entity.locales = locales
      entity.languages = languages
      entity.loadingLocale = null
      entity.userId = null
      entity.isUnsaved = false
      applyDocumentLanguage(entity.locale, entity.dir)
    },

    localeChange(entity, payload, api) {
      const locale = payload?.value ?? payload
      if (!requestLocale(entity, locale, api)) return
      if (!saveUserLocale) return

      if (entity.userId) saveUserLocale(locale, api)
      else entity.isUnsaved = true
    },

    localeLoadSuccess(entity, locale) {
      if (entity.loadingLocale !== locale) return
      entity.loadingLocale = null
      switchLocale(entity, locale)
    },

    localeLoadError(entity, { locale, error }) {
      if (entity.loadingLocale !== locale) return
      entity.loadingLocale = null
      console.warn(`[i18n] could not load "${locale}":`, error)
    },

    userLocaleLoad(entity, { userId, locale }, api) {
      if (entity.userId === userId) return
      entity.userId = userId

      if (entity.isUnsaved || !locale) {
        entity.isUnsaved = false
        saveUserLocale?.(entity.loadingLocale ?? entity.locale, api)
        return
      }

      requestLocale(entity, locale, api)
    },

    userLocaleClear(entity) {
      entity.userId = null
      entity.isUnsaved = false
    },
  }

  function requestLocale(entity, locale, api) {
    if (!locales.includes(locale)) return false
    const isChange = locale !== entity.locale
    entity.loadingLocale = null

    if (loader.isLoaded(locale)) {
      if (isChange || locale !== instance.language) switchLocale(entity, locale)
      return isChange
    }

    const id = entity.id
    entity.loadingLocale = locale
    loader.load(locale).then(
      () => api.notify(`#${id}:localeLoadSuccess`, locale),
      (error) => api.notify(`#${id}:localeLoadError`, { locale, error }),
    )
    return isChange
  }

  function switchLocale(entity, locale) {
    instance.changeLanguage(locale)
    entity.locale = locale
    entity.dir = instance.dir(locale)
    saveLocale(storageKey, locale)
    applyDocumentLanguage(locale, entity.dir)
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

  function t(key, options) {
    return instance.t(key, options)
  }

  return {
    I18n,
    ready,
    languages,
    t,
    trans,
    currentLocale: () => instance.language,
    labelled: (labelKey, fields = {}) => ({
      ...fields,
      labelKey,
      get label() {
        return t(labelKey)
      },
    }),
    translatedLabel: (option) =>
      option.labelKey ? t(option.labelKey) : option.label,
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
  for (const language of preferred) {
    const locale = matchLocale(language, locales)
    if (locale) return locale
  }

  return defaultLocale
}

function matchLocale(language, locales) {
  if (!language) return null
  if (locales.includes(language)) return language
  const [base] = language.split("-")
  return locales.includes(base) ? base : null
}

/**
 * Turns `catalogues`, a map from file path to catalogue such as
 * `import.meta.glob` returns, into the resources and loader i18next needs.
 * Each file is a locale named after it: `./locales/it.json` is `it`. A lazy
 * glob gives functions, loaded on demand; an eager one gives the modules,
 * bundled. Either way the file is the `translation` namespace.
 */
function fromCatalogues(catalogues, resources, loadLocale) {
  if (!catalogues) return { resources, loadLocale, cataloguedLocales: [] }

  const eager = { ...resources }
  const lazy = {}
  for (const [path, entry] of Object.entries(catalogues)) {
    const locale = localeOfPath(path)
    if (typeof entry === "function") lazy[locale] = entry
    else eager[locale] = { translation: entry.default ?? entry }
  }

  return {
    resources: eager,
    loadLocale: async (locale) => {
      if (!lazy[locale]) return loadLocale?.(locale)
      const module = await lazy[locale]()
      return { translation: module.default ?? module }
    },
    cataloguedLocales: Object.keys(catalogues).map(localeOfPath),
  }
}

function localeOfPath(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
}

/**
 * Loads each locale's catalogues once, through `loadLocale`. Locales in
 * `resources` are loaded already, and without `loadLocale` every locale counts
 * as loaded. A failed load is forgotten, so the next request tries again.
 */
function createLoader(instance, resources, loadLocale) {
  const loaded = new Set(Object.keys(resources))
  const pending = new Map()

  function isLoaded(locale) {
    return !loadLocale || loaded.has(locale)
  }

  function load(locale) {
    if (isLoaded(locale)) return Promise.resolve()
    if (pending.has(locale)) return pending.get(locale)

    const promise = new Promise((resolve) => resolve(loadLocale(locale)))
      .then((bundles) => {
        for (const [namespace, catalogue] of Object.entries(bundles ?? {})) {
          instance.addResourceBundle(locale, namespace, catalogue, true, true)
        }
        loaded.add(locale)
      })
      .finally(() => pending.delete(locale))
    pending.set(locale, promise)
    return promise
  }

  return { isLoaded, load }
}

/**
 * A language by its own name, as whoever speaks it looks for it in a picker:
 * "Italiano", "Français". Falls back to the code where `Intl` cannot name it.
 */
function languageName(locale) {
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(
      locale,
    )
    return name.replace(/^\p{Ll}/u, (letter) =>
      letter.toLocaleUpperCase(locale),
    )
  } catch {
    return locale
  }
}

function readLocale(storageKey) {
  if (!storageKey) return null
  try {
    return globalThis.localStorage?.getItem(storageKey) ?? null
  } catch {
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

function getDocumentLanguage() {
  return globalThis.document?.documentElement.lang
}

function applyDocumentLanguage(locale, dir) {
  if (typeof document === "undefined") return
  document.documentElement.lang = locale
  document.documentElement.dir = dir
}
