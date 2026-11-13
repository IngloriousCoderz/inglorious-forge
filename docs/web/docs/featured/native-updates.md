---
title: Native App Updates
description: "Blocking a native build below the minimum until the user updates from the store"
---

# Native App Updates

A Capacitor app carries its web code inside the binary, so only the stores update it. `@inglorious/web/native-update` makes an update mandatory: the app reads a minimum build per platform, and a build below it is blocked until the user updates. `@inglorious/create-app --mobile --push` sets it up with Supabase.

```javascript
import { App } from "@capacitor/app"
import {
  createNativeUpdate,
  watchNativeUpdate,
} from "@inglorious/web/native-update"

const types = { NativeUpdate: [createNativeUpdate({ adapter }), template] }
const entities = { nativeUpdate: { type: "NativeUpdate" } }

watchNativeUpdate(App, store)
```

`watchNativeUpdate` reads the installed build at launch and on every resume, and does nothing outside a native app. `{ id }` as a third argument notifies another entity; it returns a function that stops watching.

The adapter says where the minimum lives: `requirement(platform)` resolves to `{ minBuild, storeUrl }`, or `null` for no minimum. `supabaseNativeUpdate` from `@inglorious/supabase` reads it from a table.

The `nativeUpdate` entity contains:

- `isUpdateRequired` — the installed build is below the minimum
- `storeUrl` — where the update button goes, or `null`

Events:

- `nativeUpdateCheck` — `{ platform, build }`, sent by `watchNativeUpdate`
- `nativeUpdateApply` — opens the store

A failed check keeps the last answer, so nobody is blocked by being offline. Render the whole app as the update page while `isUpdateRequired`, and raise the minimum only once the new build is live in that store.
