# @inglorious/i18n

## 1.2.0

### Minor Changes

- The writing direction follows the language: `<html dir>` and `entity.dir` are `rtl` for Arabic, Hebrew, Persian and the other right-to-left languages, `ltr` otherwise.

## 1.1.0

### Minor Changes

- Much less to write in an app:

  - `catalogues` takes `import.meta.glob("./locales/*.json")` as is: each file is a locale, loaded on demand, so adding a language is adding its file. `ready` resolves once the starting language and the fallback are loaded; mount after it. A switch to a locale not loaded yet loads it first, only the latest choice applies, and a failed load keeps the current language. `resources` with `loadLocale` is the lower-level way to the same.
  - `entity.languages` (and the returned `languages`) lists the locales named in themselves for a picker, and `localeChange` accepts a picker's `{ value }`.
  - `saveUserLocale` with the `userLocaleLoad` / `userLocaleClear` events keeps the language with the user's account: saved on change, a choice made before signing in wins, otherwise the saved one applies.
  - `currentLocale`, `labelled` and `translatedLabel` are returned by `createI18n`.

## 1.0.0

### Major Changes

- New package: internationalization for Inglorious Web. `createI18n` sets up an i18next instance and an `I18n` type whose entity holds the active locale, so changing language is an ordinary store event. It detects the device language, remembers the user's choice and keeps `<html lang>` in sync. `trans` renders translations with markup in them: their tags map to components, and interpolated values stay text.
