---
title: PWA Updates
description: 'Keeping an installed PWA on its latest version, and offering "Update now"'
---

# PWA Updates

The `PwaUpdate` type keeps an installed PWA on its latest version. It works with the service worker that [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) generates, and `@inglorious/create-app --pwa` sets it up for you.

Updates are not optional. A new version downloads in the background, and is applied with a reload at the first moment nobody is in the middle of something: at launch, before anything is touched, and each time the app goes to the background or comes back to the foreground. It also checks for a new version every hour and on every return to the foreground: a phone suspends an installed PWA rather than closing it, so the browser's own check may never come.

```javascript
import { isNative } from "@inglorious/web/native"
import { createPwaUpdate } from "@inglorious/web/pwa"
import { registerSW } from "virtual:pwa-register"

if (!isNative()) registerSW()

const types = { PwaUpdate: createPwaUpdate() }
const entities = { pwaUpdate: { type: "PwaUpdate" } }
```

Configure the plugin with `registerType: "prompt"` and `injectRegister: false`: the generated worker then waits for the `SKIP_WAITING` message the type sends. The type reads the registration from `navigator.serviceWorker.ready`, and does nothing in a native app or without a service worker. `checkEveryMs` changes how often it checks.

## Offering "Update now"

A version that lands while someone is using the app waits for the next trip to the background, and sets the entity's `isUpdateReady` meanwhile. `pwaUpdateApply` moves over at once:

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

Inglorious UI's `Snackbar` is the usual place for it.
