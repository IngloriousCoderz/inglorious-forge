---
name: i18n
description: "@inglorious/i18n: i18next for Inglorious Web with the locale in a store entity - translations, plurals, Intl formatting, markup via trans, content's own translations via localized."
---

# @inglorious/i18n

```javascript
import { createI18n } from "@inglorious/i18n";

export const { I18n, t, trans, localized, ready, currentLocale } = createI18n({
  catalogues: import.meta.glob("./locales/*.json"),
  defaultLocale: "en",
  storageKey: "my-app-locale", // optional
  queryParam: "lang", // optional
});

ready.then(() => mount(store, renderApp, document.getElementById("root")));
```

Register `I18n`, add entity `i18n: { type: "I18n" }`, switch with `api.notify("#i18n:localeChange", "it")` (also accepts `{ value }`).

- Start locale: query param → saved → device language (base match) → default.
- Sets `<html lang>` and `dir` (`entity.dir`). Use logical CSS properties, `var(--iw-dir-sign)`, `Icon`'s `direction`.
- Unloaded locales load first (`entity.loadingLocale`); failures keep the current one.
- `entity.languages` is picker options from `Intl.DisplayNames`.
- Per-user locale: `saveUserLocale: (locale, api) => ...`, then `#i18n:userLocaleLoad` `{ userId, locale }` and `#i18n:userLocaleClear` on sign-out.
- Also exported: `languages`, `i18next`, `detectLocale`; `resources`/`loadLocale` instead of `catalogues`.

`t(key, options)`: `{{name}}`, `key_one`/`key_other`/`key_many` with `count`, `{{date, datetime}}`; also takes `{ key, values }`; non-keys pass through.

```javascript
// "Logging in as <strong>{{email}}</strong>."
trans("loggedInAs", { values: { email }, components: { strong: (children) => html`<strong>${children}</strong>` } });
```

Only tags in `components` render; values are text.

`localized(record.labels)`: content's own translations (`{ en, it, … }` from a DB/CMS), active locale else `defaultLocale`, else `undefined`. Call it at render, keep the record in state.

## Rules

- Store keys or `{ key, values }` in state, never translated text. Module-level labels hold keys.
- Sentences with markup stay one key, rendered with `trans`. Never `unsafeHTML` a `t()` result.
- Add `_many` where the language has it.
- Format with `Intl` in `currentLocale()`.
- Vitest without DOM: stub `navigator` (and `localStorage` with `storageKey`).
- SSX: sync with `api.notify("#i18n:localeChange", entity.locale)`.
