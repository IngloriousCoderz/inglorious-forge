---
title: Storage
description: Keeping entity fields in Capacitor Preferences, which survives the system clearing a WebView's data
---

# Storage

iOS and Android can clear a WebView's `localStorage` when the device runs low on space, taking with it whatever an app kept there: consent, settings, even the sign-in. `createNativeStorage` from `@inglorious/web/device/storage` keeps values in [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences) in the native app instead. In a browser, it uses `localStorage`.

## With `withStorage`

The entity stays the one source of truth: [`withStorage`](https://inglorious.dev/store/api/reference#withstorage-fields-options) keeps some of its fields as a byproduct, and takes any storage.

```javascript
import { Preferences } from "@capacitor/preferences"
import { withStorage } from "@inglorious/store/storage"
import { createNativeStorage } from "@inglorious/web/device/storage"

const preferences = createNativeStorage({ plugin: Preferences })

const types = {
  Settings: [Settings, withStorage(["theme"], { storage: () => preferences })],
}
```

## Waiting for Preferences

Preferences answers with promises. So in the native app the entity starts with its type's defaults, and a moment later `storageRestore` brings back the stored fields. Nothing is written before that.

A type that has to tell others what came back defines its own `storageRestore`:

```javascript
const Session = [
  {
    create(entity) {
      entity.user ??= null
    },
    storageRestore(entity, restored, api) {
      api.notify("sessionChange", { user: entity.user })
    },
  },
  withStorage(["user"], { storage: () => preferences }),
]
```

## The Supabase session

The same storage keeps Supabase's session, so signing in survives the same clean-ups:

```javascript
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(url, key, { auth: { storage: preferences } })
```

## Secrets

`createSecureStorage` keeps what must stay private, such as a session's tokens, in the Keychain (iOS) or Keystore (Android), through the same [`@capgo/capacitor-native-biometric`](https://github.com/Cap-go/capacitor-native-biometric) plugin. A browser has nothing safer, so there it uses `localStorage`. It works wherever `createNativeStorage` does:

```javascript
import { NativeBiometric } from "@capgo/capacitor-native-biometric"
import { createSecureStorage } from "@inglorious/web/device/storage"

const secrets = createSecureStorage({ plugin: NativeBiometric })

createClient(url, key, { auth: { storage: secrets } })
```
