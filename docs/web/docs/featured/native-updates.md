---
title: Native App Updates
description: "Blocking a native build below the minimum until the user updates from the store"
---

# Native App Updates

A Capacitor app carries its web code inside the binary, so only the stores update it. The `NativeUpdate` type makes an update mandatory: the app reads a minimum build per platform, and a build below it is blocked until the user updates. `@inglorious/create-app --mobile --push` sets it up with Supabase.

```javascript
import { App } from "@capacitor/app"
import { createNativeUpdate } from "@inglorious/web/native/update"

const types = {
  NativeUpdate: [createNativeUpdate({ adapter, plugin: App }), template],
}
const entities = { nativeUpdate: { type: "NativeUpdate" } }
```

With `App` from `@capacitor/app` as `plugin`, the type checks the installed build at launch and on every resume, and does nothing outside a native app. Without it, the app sends `nativeUpdateCheck` with `{ platform, build }` itself.

The adapter says where the minimum lives: `requirement(platform)` resolves to `{ minBuild, storeUrl }`, or `null` for no minimum. `supabaseNativeUpdate` from `@inglorious/supabase` reads it from a table.

The entity holds `isUpdateRequired` and `storeUrl`, where `nativeUpdateApply` sends the user. A failed check keeps the last answer, so nobody is blocked by being offline. Render the whole app as the update page while `isUpdateRequired`, and raise the minimum only once the new build is live in that store.
