---
title: Live Updates
description: "Replacing the web code inside a Capacitor app with a newer signed bundle"
---

# Live Updates

A store release is only needed for native changes. `@inglorious/web/live-update` replaces the web code inside a Capacitor app with a newer published bundle, through [`@capawesome/capacitor-live-update`](https://capawesome.io/plugins/live-update/), whose open source plugin downloads from any URL. `publishLiveUpdate` from `@inglorious/supabase/live-update` publishes one.

```javascript
import { App } from "@capacitor/app"
import { LiveUpdate } from "@capawesome/capacitor-live-update"
import { createLiveUpdate, watchLiveUpdate } from "@inglorious/web/live-update"

const types = { LiveUpdate: createLiveUpdate({ plugin: LiveUpdate }) }
const entities = { liveUpdate: { type: "LiveUpdate" } }

watchLiveUpdate({
  plugin: LiveUpdate,
  app: App,
  store,
  manifestUrl,
  release: Number(import.meta.env.VITE_LIVE_UPDATE_RELEASE),
})
```

`watchLiveUpdate` tells the plugin the running bundle works, then reads the manifest at launch, every hour (`checkEveryMs`) and on each resume. The manifest is `{ release, minBuild, url, checksum, signature }`. A bundle is wanted when its `release` is newer than the running one and the installed build is at least `minBuild` (`isLiveUpdateWanted`). It downloads in the background, is applied on the next pause, and is announced as `#liveUpdate:liveUpdateReady` meanwhile; `liveUpdateApply` moves over at once. It does nothing outside a native app, and returns a function that stops watching.

`release` must grow with every build, like the build's timestamp, and only release builds should have one: a development build without it must not watch, or it would turn into the published code.

Set `publicKey` in the plugin's Capacitor config so it refuses unsigned bundles, and `readyTimeout` so a bundle that doesn't start is rolled back; with `autoBlockRolledBackBundles`, `watchLiveUpdate` never downloads it again.
