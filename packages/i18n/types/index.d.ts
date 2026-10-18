import type { i18n, InitOptions, Resource, TOptions } from "i18next"

/** A catalogue file as a glob gives it: the module, or a function loading it. */
export type CatalogueEntry =
  Record<string, unknown> | (() => Promise<Record<string, unknown>>)

export interface I18nOptions {
  /**
   * The catalogues by file path, as `import.meta.glob("./locales/*.json")`
   * returns them. Each file is a locale named after it; a lazy glob loads them
   * on demand, an eager one bundles them.
   */
  catalogues?: Record<string, CatalogueEntry>
  /** The catalogues bundled with the app, by locale: `{ en: { translation: { … } }, it: … }`. */
  resources?: Resource
  /** The supported locales, in picker order. Defaults to those in `resources` and `catalogues`; list them all when some are loaded with `loadLocale`. */
  locales?: string[]
  /**
   * Loads a locale that is not in `resources`, resolving to its catalogues by
   * namespace: `{ translation: { … } }`. Typically a dynamic import, so each
   * catalogue is its own chunk.
   */
  loadLocale?: (locale: string) => Promise<Resource[string]>
  /** The fallback, and the locale when nothing else matches. Defaults to the first locale. */
  defaultLocale?: string
  /** Where to remember the user's choice in localStorage. Omit to not remember it. */
  storageKey?: string
  /**
   * Saves the user's locale wherever the app keeps their preferences, e.g.
   * `(locale, api) => api.notify("#profile:localeSave", locale)`. Called for a
   * change while a user is signed in, and when one signs in after choosing.
   */
  saveUserLocale?: (locale: string, api: unknown) => void
  /** Any further i18next options. `resources`, `lng`, `fallbackLng`, `supportedLngs` and `initAsync` are set by `createI18n`. */
  i18nextOptions?: InitOptions
}

export interface I18nEntity {
  id: string
  type: string
  /** The active locale. */
  locale?: string
  /** Its writing direction, also set on `<html dir>`. */
  dir?: "ltr" | "rtl"
  /** The supported locales, for a language picker. */
  locales?: string[]
  /** The supported locales named in themselves, as options for a picker. */
  languages?: LanguageOption[]
  /** The locale being loaded before a change, if any. */
  loadingLocale?: string | null
  /** The signed-in user, once `userLocaleLoad` has named them. */
  userId?: string | null
  /** A choice made before signing in, to save for the next user. */
  isUnsaved?: boolean
}

export interface LanguageOption {
  value: string
  /** The language in itself: "Italiano", "Français". */
  label: string
}

export interface I18nType {
  create(entity: I18nEntity): void
  /**
   * Switches to `locale`, remembers it and sets `<html lang>`. Unsupported
   * locales are ignored. A locale not loaded yet is loaded first, and the
   * switch follows in `localeLoadSuccess`.
   */
  localeChange(
    entity: I18nEntity,
    locale: string | { value: string },
    api?: unknown,
  ): void
  localeLoadSuccess(entity: I18nEntity, locale: string): void
  localeLoadError(
    entity: I18nEntity,
    payload: { locale: string; error: unknown },
  ): void
  /**
   * The signed-in user and their saved locale (`null` for none). Applies it,
   * or saves the current one if it was chosen before signing in or nothing
   * was saved. Once per user.
   */
  userLocaleLoad(
    entity: I18nEntity,
    payload: { userId: string; locale: string | null },
    api: unknown,
  ): void
  /** Signed out: later choices wait for the next user. */
  userLocaleClear(entity: I18nEntity): void
}

export interface TransOptions<Part = unknown> {
  /** Values for the `{{placeholders}}`. They are inserted as text, never as markup. */
  values?: TOptions
  /** One renderer per tag name the translation uses; it receives the tag's contents. */
  components?: Record<string, (children: Array<string | Part>) => Part>
}

export interface I18n {
  /** The type to register in the store, e.g. `types: { I18n }` with an `i18n` entity. */
  I18n: I18nType
  /** Resolves once the starting locale and the fallback are loaded. Mount after it. */
  ready: Promise<void>
  /** The supported locales named in themselves, as options for a picker. */
  languages: LanguageOption[]
  /** The active locale, for `Intl` formatters. */
  currentLocale: () => string
  /** A data item whose `label` is `t(labelKey)` whenever it is read. */
  labelled: <Fields extends object>(
    labelKey: string,
    fields?: Fields,
  ) => Fields & { labelKey: string; readonly label: string }
  /** An option's label: `t(labelKey)` when it has one, `label` otherwise. */
  translatedLabel: (option: { labelKey?: string; label?: string }) => string
  /** Translates `key` in the active locale. Same signature as i18next's `t`. */
  t: (key: string | string[], options?: TOptions) => string
  /**
   * Translates `key` into template parts, rendering the tags in the translation
   * through `components`. Tags without a component show as written.
   */
  trans: <Part = unknown>(
    key: string | string[],
    options?: TransOptions<Part>,
  ) => Array<string | Part>
  /** The underlying i18next instance, for anything the adapter does not cover. */
  i18next: i18n
}

export function createI18n(options: I18nOptions): I18n

export function detectLocale(options: {
  locales: string[]
  defaultLocale: string
  storageKey?: string
}): string
