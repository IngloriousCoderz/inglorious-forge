---
title: PWA Updates
description: 'Keeping an installed PWA on its latest version, and offering "Update now"'
---

# PWA Updates

`@inglorious/web/pwa` keeps an installed PWA on its latest version. It works with the service worker that [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) generates, and `@inglorious/create-app --pwa` sets it up for you.

Updates are not optional. A new version downloads in the background, and is applied with a reload at the first moment nobody is in the middle of something:

- at launch, before anything is touched;
- each time the app goes to the background or comes back to the foreground.

It also checks for a new version every hour and on every return to the foreground: a phone suspends an installed PWA rather than closing it, so the browser's own check may never come.

```javascript
import { isNative } from "@inglorious/web/native"
import { watchPwaUpdate } from "@inglorious/web/pwa"
import { registerSW } from "virtual:pwa-register"

if (!isNative()) {
  registerSW({
    onRegisteredSW(url, registration) {
      if (registration) watchPwaUpdate(registration)
    },
  })
}
```

Configure the plugin with `registerType: "prompt"` and `injectRegister: false`: the generated worker then waits for the `SKIP_WAITING` message this module sends, instead of taking over on its own.

## Offering "Update now"

A version that lands while someone is using the app waits for the next trip to the background. To offer it right away, pass the store and register the `PwaUpdate` type:

```javascript
import { PwaUpdate, watchPwaUpdate } from "@inglorious/web/pwa"

const store = createStore({ types: { PwaUpdate }, autoCreateEntities: true })

watchPwaUpdate(registration, store)
```

The `pwaUpdate` entity contains:

- `isUpdateReady` — a new version is waiting for the next reload

Events:

- `pwaUpdateReady` — sent by `watchPwaUpdate` when a version lands mid-session
- `pwaUpdateApply` — moves over to the waiting version now, reloading the page

```javascript
const renderUpdate = (api) =>
  when(
    api.getEntity("pwaUpdate").isUpdateReady,
    () =>
      html`<button @click=${() => api.notify("#pwaUpdate:pwaUpdateApply")}>
        Update now
      </button>`,
  )
```

Inglorious UI's `Snackbar` is the usual place for it. `watchPwaUpdate` takes `{ id, checkEveryMs }` as a third argument, to announce to an entity with another id or to check more or less often, and returns a function that stops watching.
