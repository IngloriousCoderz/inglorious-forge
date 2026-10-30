# @inglorious/firebase

Firebase integration for Inglorious Web, in the browser and in Capacitor apps. It provides two adapters, each with its own entry point, so an app loads only the plugin it uses:

- `@inglorious/firebase/push`: push notifications through Firebase Cloud Messaging, for [`createPushPrompt`](https://inglorious.dev/web/featured/push).
- `@inglorious/firebase/analytics`: Google Analytics for Firebase, for [`createAnalytics`](https://inglorious.dev/web/featured/analytics).

Each works in a browser (the PWA) and in the Android and iOS apps alike, through [Capawesome's Capacitor Firebase plugins](https://github.com/capawesome-team/capacitor-firebase).

## Install

```bash
pnpm add @inglorious/firebase @inglorious/web @capacitor/core firebase@^12
pnpm add @capacitor-firebase/messaging   # for push
pnpm add @capacitor-firebase/analytics   # for analytics
```

The native apps read the Firebase project from `android/app/google-services.json` and `ios/App/GoogleService-Info.plist`. A browser gets it from the `firebase` option: the web app's config from the Firebase console.

## Push

```js
import { firebasePush } from "@inglorious/firebase/push"
import { createPushPrompt } from "@inglorious/web/push"

export const push = firebasePush({
  firebase: firebaseConfig,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  saveToken: (token, platform) => db.saveToken(token, platform),
  deleteToken: (token) => db.deleteToken(token),
})

const prompt = createPushPrompt({ adapter: push })

// At sign-out, before the session ends:
await push.unregister()
```

- One token per device, saved through `saveToken` with its platform (`"web"`, `"android"` or `"ios"`) at every sign-in, so a rotated token is saved again.
- `unregister()` deletes the token this device saved, through `deleteToken`.
- In a browser, pushes arrive at the PWA's own service worker as Web Push carrying FCM's JSON: that worker shows them and handles their taps. In the native apps the system shows them, and taps open their `url` through the router.
- Sending is the server's: FCM's HTTP v1 API, with a service account allowed to send (the **Firebase Cloud Messaging API Admin** role).

## Analytics

```js
import { firebaseAnalytics } from "@inglorious/firebase/analytics"
import { createAnalytics } from "@inglorious/web/analytics"

const analytics = firebaseAnalytics({ firebase: firebaseConfig })
const types = {
  Analytics: [createAnalytics({ adapter: analytics }), renderers],
}
```

`firebaseConfig` needs its `measurementId`. The PWA reports to the project's web stream, and the native apps to theirs.

**Consent.** Nothing loads in a browser before the user agrees, and refusing loads nothing either. The native apps must start with collection off, or they measure from launch:

```xml
<!-- android/app/src/main/AndroidManifest.xml, inside <application> -->
<meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />
```

```xml
<!-- ios/App/App/Info.plist -->
<key>FIREBASE_ANALYTICS_COLLECTION_ENABLED</key>
<false/>
```

Advertising consents stay denied: the adapter measures how the app is used, nothing more.

**Page views.** In a browser, Google Analytics counts history changes as page views by itself. In the native apps, the adapter logs a screen view on each route change, named after the route.
