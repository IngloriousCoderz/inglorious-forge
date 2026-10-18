import type { i18n, InitOptions, Resource, TOptions } from "i18next"

export interface I18nOptions {
  /** The catalogues, by locale: `{ en: { translation: { … } }, it: … }`. */
  resources: Resource
  /** The supported locales. Defaults to the keys of `resources`. */
  locales?: string[]
  /** The fallback, and the locale when nothing else matches. Defaults to the first locale. */
  defaultLocale?: string
  /** Where to remember the user's choice in localStorage. Omit to not remember it. */
  storageKey?: string
  /** Any further i18next options. `resources`, `lng`, `fallbackLng`, `supportedLngs` and `initAsync` are set by `createI18n`. */
  i18nextOptions?: InitOptions
}

export interface I18nEntity {
  id: string
  type: string
  /** The active locale. */
  locale?: string
  /** The supported locales, for a language picker. */
  locales?: string[]
}

export interface I18nType {
  create(entity: I18nEntity): void
  /** Switches to `locale`, remembers it and sets `<html lang>`. Unsupported locales are ignored. */
  localeChange(entity: I18nEntity, locale: string): void
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
