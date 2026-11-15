---
name: firebase
description: "@inglorious/firebase: firebasePush (FCM) for createPushPrompt and firebaseAnalytics for createAnalytics, in browser and Capacitor apps, consent first."
---

# @inglorious/firebase

```bash
pnpm add @inglorious/firebase @inglorious/web @capacitor/core firebase@^12
pnpm add @capacitor-firebase/messaging   # push
pnpm add @capacitor-firebase/analytics   # analytics
```

Keep `firebase` on 12.x. Native apps read `google-services.json` and `GoogleService-Info.plist`: keep both in the project root, and `inglorious-capacitor configure` copies them into `android/app/` and the iOS target on `cap sync`; browsers take the `firebase` option (web config, not secret).

## Push

```javascript
import { firebasePush } from "@inglorious/firebase/push";
import { createPushPrompt } from "@inglorious/web/push";

export const push = firebasePush({
  firebase: firebaseConfig,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  saveToken: (token, platform) => saveToken(token, platform), // "web" | "android" | "ios"
  deleteToken: (token) => deleteToken(token),
});

const prompt = createPushPrompt({ adapter: push });
const types = {
  PushPrompt: { ...prompt, ...template, sessionStart: prompt.pushStart, sessionEnd: prompt.pushStop },
};

await push.unregister(); // on sign-out, before the session ends
```

- Browser: the PWA's own service worker receives them; no `firebase-messaging-sw.js`. Send data only: `{ token, data: { title, body, url } }`.
- Native: send `notification` plus `data.url`; a tap navigates to `url`. Android shows nothing in the foreground.
- Server: FCM HTTP v1 with a service account holding `roles/firebasecloudmessaging.admin` (not `roles/firebasenotifications.admin`). 404 means delete the token.

## Analytics

```javascript
import { firebaseAnalytics } from "@inglorious/firebase/analytics";
import { createAnalytics } from "@inglorious/web/analytics";

const types = {
  Analytics: [createAnalytics({ adapter: firebaseAnalytics({ firebase: firebaseConfig }) }), template],
};
```

- `firebaseConfig` needs `measurementId`. No gtag snippet in `index.html`.
- Nothing loads before consent.
- Native collection starts off: `<meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />` in `AndroidManifest.xml`, `FIREBASE_ANALYTICS_COLLECTION_ENABLED` = `false` in `Info.plist`.
- Advertising consents stay denied. `inglorious-capacitor configure` removes the `AD_ID` permissions Firebase merges into the Android app, so Play Console's advertising ID declaration is "No".
- `pageView` is a no-op in browsers; native logs a screen view per route.
