# @inglorious/i18n

Internationalization for `@inglorious/web`: an [i18next](https://www.i18next.com/) instance driven by a store entity.

i18next does the translating (interpolation, plurals, fallbacks, formatting through `Intl`). This package is the binding to the Inglorious store, the way `react-i18next` is the binding to React: the active locale lives in an entity, so changing language is an ordinary event, and the render that follows reads every string in the new language.

## Install

```bash
pnpm add @inglorious/i18n
```

## Usage

Put one JSON catalogue per language in a folder, named after it (`en.json`, `it.json`, …), and hand the folder to `createI18n`:

```javascript
// src/i18n.js
import { createI18n } from "@inglorious/i18n"

export const { I18n, t, trans, ready } = createI18n({
  catalogues: import.meta.glob("./locales/*.json"),
  defaultLocale: "en",
  storageKey: "my-app-locale",
})
```

Each catalogue is its own chunk, loaded when it is needed. Mount once `ready` resolves: by then the user's language and the fallback are loaded, so the first render is already translated.

```javascript
ready.then(() => mount(store, renderApp, document.getElementById("root")))
```

Adding a language is adding its file.

Register the type and an entity for it:

```javascript
import { createStore } from "@inglorious/store"

import { I18n } from "./i18n.js"

export const store = createStore({
  types: { I18n /* , … */ },
  entities: { i18n: { type: "I18n" } /* , … */ },
})
```

Translate in any template:

```javascript
import { html } from "@inglorious/web"

import { t } from "../i18n.js"

export const Events = {
  render(entity) {
    return html`<h1>${t("events.title")}</h1>
      <p>${t("events.count", { count: entity.events.length })}</p>`
  },
}
```

Switch language from anywhere:

```javascript
api.notify("#i18n:localeChange", "it")
```

Switching to a locale that is not loaded yet loads it first: `entity.loadingLocale` names it until it arrives, then the switch happens as usual. Only the latest choice switches, each locale is loaded once, and a failed load leaves the current language in place and is tried again on the next change.

## A language picker

`entity.languages` lists the supported locales as picker options, each named in itself so whoever needs it finds it whatever language is showing: `[{ value: "en", label: "English" }, { value: "it", label: "Italiano" }, …]`. The names come from `Intl.DisplayNames`. `localeChange` takes a picker's `{ value }` as well as a plain locale, so a select can notify it directly.

## The user's language

The choice is remembered on the device with `storageKey`. To keep it with the user's account instead, so it follows them to every device, pass `saveUserLocale` and tell the entity who signed in:

```javascript
createI18n({
  catalogues: import.meta.glob("./locales/*.json"),
  saveUserLocale: (locale, api) => api.notify("#profile:localeSave", locale),
})

// When the user's data arrives:
api.notify("#i18n:userLocaleLoad", { userId: user.id, locale: user.locale })
// When they sign out:
api.notify("#i18n:userLocaleClear")
```

- A change while signed in is saved at once.
- A change made before signing in, such as on the login screen, is saved when the user arrives: it is the more recent choice.
- Otherwise the user's saved locale is applied, or the current one is saved if they have none.
- It happens once per user, so reloading their data does not undo a change still being saved.

## Labels in data

Options defined in data would freeze in the language of the moment they were created. `labelled(key, fields)` gives an item whose `label` is translated every time it is read, and which keeps `labelKey` when it is copied into store state; `translatedLabel(option)` reads either kind:

```javascript
const periods = [labelled("periods.week", { value: "week" })]

translatedLabel(periods[0]) // "This week", or "Questa settimana"
translatedLabel({ label: "Lombardy" }) // data, not copy: as is
```

## API

### `createI18n(options)`

Returns `{ I18n, ready, languages, t, trans, currentLocale, labelled, translatedLabel, i18next }`.

- `catalogues`: the catalogues by file path, as `import.meta.glob("./locales/*.json")` returns them. A lazy glob loads each on demand; an eager one (`{ eager: true }`) bundles them all.
- `resources`: catalogues bundled with the app, `{ [locale]: { translation: { … } } }`. The lower-level alternative to `catalogues`.
- `loadLocale`: loads a locale that is not in `resources`, resolving to `{ translation: { … } }`. The lower-level alternative to a lazy glob.
- `locales`: the supported locales, in picker order. Defaults to those in `catalogues` and `resources`.
- `saveUserLocale`: saves the locale for the signed-in user. See [The user's language](#the-users-language).
- `isServerRendered`: whether the page comes rendered from a server, as with SSX. It then starts in the language of `<html lang>`, the one the server rendered, so hydration keeps it and only its catalogue loads. Leave it off for a page served as is, whose `<html lang>` says nothing about the visitor.
- `defaultLocale`: the fallback, and the locale when nothing else matches. Defaults to the first locale.
- `storageKey`: where to remember the user's choice in `localStorage`. Omit it to not remember the choice.
- `i18nextOptions`: any further i18next options.

The starting locale is that of `<html lang>` on a server-rendered page, when supported, else the saved choice, else the first of the device's languages that is supported (`it-CH` picks `it`), else `defaultLocale`.

`ready` resolves once the starting locale and the fallback are loaded: at once when they are bundled. With every catalogue bundled, i18next also switches synchronously, so there is no loading state to handle.

### The `I18n` type

- `create(entity)`: sets `entity.locale`, `entity.dir`, `entity.locales` and `entity.languages`, and `<html lang>` and `<html dir>`. `dir` is `rtl` for right-to-left languages such as Arabic or Hebrew; styles written with logical properties (`margin-inline-start`, `text-align: start`) mirror on their own.
- `localeChange(entity, locale)`: switches i18next, updates `entity.locale`, remembers the choice and sets `<html lang>`. Takes a locale or a picker's `{ value }`; unsupported locales are ignored. A locale not loaded yet is loaded first (`entity.loadingLocale`), and the switch follows in `localeLoadSuccess`.
- `userLocaleLoad(entity, { userId, locale })` and `userLocaleClear(entity)`: the signed-in user's locale. See [The user's language](#the-users-language).

### `t(key, options)`

i18next's `t`, bound to this instance. Everything i18next supports works:

```json
{
  "greet": "Hello, {{name}}",
  "event_one": "{{count}} event",
  "event_other": "{{count}} events",
  "deadline": "Closes on {{date, datetime}}"
}
```

```javascript
t("greet", { name: "Ada" })
t("event", { count: 3 })
t("deadline", {
  date: new Date(),
  formatParams: { date: { day: "numeric", month: "short" } },
})
```

Interpolated values are not HTML-escaped: lit-html escapes every text binding already.

### `trans(key, { values, components })`

For translations with markup in them. The tags are placeholders, not HTML: each one is rendered by the component of the same name, so the translator decides where the bold text or the link goes, and the word order can differ between languages.

```json
{
  "loggedInAs": "Logging in as <strong>{{email}}</strong>.",
  "terms": "Read the <link>terms of service</link>",
  "twoLines": "First line<br/>Second line"
}
```

```javascript
import { html } from "@inglorious/web"

html`<p>
  ${trans("loggedInAs", {
    values: { email },
    components: { strong: (children) => html`<strong>${children}</strong>` },
  })}
</p>`
```

It returns an array of parts (strings and what the components return), which lit renders like any other array.

It is safe with user data:

- Values are interpolated after the tags are parsed, as text: an email such as `<img src=x onerror=…>` shows as typed.
- A tag without a component (`<script>`, a typo, a stray `</b>`) shows as written instead of becoming markup.
- Plurals and formatters work as in `t`: `trans("events", { values: { count } })`.

### `detectLocale({ locales, defaultLocale, storageKey })`

The detection `createI18n` uses, exported for apps that need it elsewhere.
