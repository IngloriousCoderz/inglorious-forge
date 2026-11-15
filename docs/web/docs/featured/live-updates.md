---
title: Live Updates
description: "Replacing the web code inside a Capacitor app with a newer signed bundle"
---

# Live Updates

A store release is only needed for native changes. The `LiveUpdate` type replaces the web code inside a Capacitor app with a newer published bundle, through [`@capawesome/capacitor-live-update`](https://capawesome.io/plugins/live-update/), whose open source plugin downloads from any URL. `publishLiveUpdate` from `@inglorious/supabase/live-update` publishes one.

```javascript
import { App } from "@capacitor/app"
import { LiveUpdate } from "@capawesome/capacitor-live-update"
import { createLiveUpdate } from "@inglorious/web/native/live-update"

const types = {
  LiveUpdate: createLiveUpdate({
    plugin: LiveUpdate,
    app: App,
    manifestUrl,
    release: Number(import.meta.env.VITE_LIVE_UPDATE_RELEASE),
  }),
}
const entities = { liveUpdate: { type: "LiveUpdate" } }
```

Once created, the type tells the plugin the running bundle works, then reads the manifest at launch, every hour (`checkEveryMs`) and on each resume. The manifest is `{ release, minBuild, url, checksum, signature }`. A bundle is wanted when its `release` is newer than the running one and the installed build is at least `minBuild` (`isLiveUpdateWanted`). It downloads in the background, sets `isUpdateReady` and `pendingRelease`, and is applied on the next pause; `liveUpdateApply` moves over at once. It does nothing outside a native app.

`release` must grow with every build, like the build's timestamp, and only release builds should have one: without it the type does nothing, so a development build never turns into the published code.

Set `publicKey` in the plugin's Capacitor config so it refuses unsigned bundles, and `readyTimeout` so a bundle that doesn't start is rolled back; with `autoBlockRolledBackBundles`, it is never downloaded again.
