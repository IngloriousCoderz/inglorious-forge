# @inglorious/i18n

Internationalization for `@inglorious/web`: an [i18next](https://www.i18next.com/) instance driven by a store entity.

i18next does the translating (interpolation, plurals, fallbacks, formatting through `Intl`). This package is the binding to the Inglorious store, the way `react-i18next` is the binding to React: the active locale lives in an entity, so changing language is an ordinary event, and the render that follows reads every string in the new language.

## Install

```bash
pnpm add @inglorious/i18n
```

## Usage

```javascript
// src/i18n.js
import { createI18n } from "@inglorious/i18n"

import en from "./locales/en.json"
import it from "./locales/it.json"

export const { I18n, t } = createI18n({
  resources: { en: { translation: en }, it: { translation: it } },
  defaultLocale: "en",
  storageKey: "my-app-locale",
})
```

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

## API

### `createI18n(options)`

Returns `{ I18n, t, trans, i18next }`.

- `resources`: the catalogues, `{ [locale]: { translation: { … } } }`.
- `locales`: the supported locales. Defaults to the keys of `resources`.
- `defaultLocale`: the fallback, and the locale when nothing else matches. Defaults to the first locale.
- `storageKey`: where to remember the user's choice in `localStorage`. Omit it to not remember the choice.
- `i18nextOptions`: any further i18next options.

The starting locale is the saved choice, else the first of the device's languages that is supported (`it-CH` picks `it`), else `defaultLocale`.

With the catalogues passed in `resources`, i18next initialises and switches synchronously, so there is no loading state to handle.

### The `I18n` type

- `create(entity)`: sets `entity.locale` and `entity.locales`, and `<html lang>`.
- `localeChange(entity, locale)`: switches i18next, updates `entity.locale`, remembers the choice and sets `<html lang>`. Unsupported locales are ignored.

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
