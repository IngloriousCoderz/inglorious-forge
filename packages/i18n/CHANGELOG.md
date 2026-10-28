# @inglorious/i18n

## 1.3.0

### Minor Changes

- Add the `isServerRendered` option to `createI18n`: a server-rendered page, as with SSX, starts in the language of `<html lang>` instead of detecting one, so hydration keeps the server's language and only its catalogue loads.

## 1.2.3

### Patch Changes

- Asking for the current locale while its catalogue is still loading now waits for it, with `loadingLocale` naming it until it arrives. Asking for a locale also switches the shared i18next instance back when another store, such as another page rendered on the same server, has moved it.

## 1.2.2

### Patch Changes

- Types follow the store's: an entity drawn by a library type extends its entity interface, such as `interface AppRouterEntity extends RouterEntity { type: "Router" }`, and the type registers under any name with no cast.

  - `@inglorious/web`'s `Api` is the store's, which loading web's types gives a `render`. `RouterEntity`, `FormEntity` and the sensor entities take `id?: string` and any `type`. `@inglorious/web/test` has types, and the `lit-html` directives (`classMap`, `repeat`, …) are typed rather than `any`.
  - `I18nEntity`, `DataGridProps` and `VirtualListEntity` take `id?: string`; `ButtonProps`' `type` is optional. Component types (`RouterType`, `I18nType`, `LogoType`, …) are type aliases, which fit a store's `types`.
  - `withRealtime` accepts the type the store composes.
  - `@inglorious/react-store`'s `useEntity("form")` gives that entity's own type, and `useSelector` reads the app's state.

## 1.2.1

### Patch Changes

- e026829: `catalogues` accepts what `import.meta.glob` returns in TypeScript.
- `LanguageOption` fits option types that allow extra fields, so `languages` can be passed to Inglorious UI's `Select` in TypeScript.

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
