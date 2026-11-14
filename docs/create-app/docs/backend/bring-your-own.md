---
title: Bring Your Own Backend
description: The adapters between the app and its services, and how to replace them
---

# Bring Your Own Backend

The generated types don't call Supabase or Firebase themselves: each takes an `adapter`, a plain object of functions. `@inglorious/supabase` and `@inglorious/firebase` provide the ones a generated app uses. To move a feature to another backend, write an object with the same functions and pass it instead. Nothing else in the app changes.

| Feature                       | Type                 | Generated adapter                | File                    |
| ----------------------------- | -------------------- | -------------------------------- | ----------------------- |
| Sign-in                       | `createAuth`         | `supabaseAuth(supabase)`         | `src/api/auth`          |
| Analytics                     | `createAnalytics`    | `firebaseAnalytics(...)`         | `src/app/analytics`     |
| Push                          | `createPushPrompt`   | `firebasePush(...)`              | `src/api/push`          |
| Mandatory native updates      | `createNativeUpdate` | `supabaseNativeUpdate(supabase)` | `src/app/native-update` |
| Live updates                  | `watchLiveUpdate`    | `liveUpdateManifestUrl(url)`     | `src/main`              |
| Entities reloading on changes | `withLiveReload`     | `realtimeSource(supabase)`       | your types              |

## Sign-in

```js
const adapter = {
  onSessionChange(listener) {}, // calls listener(user | null); returns a stop function
  async signIn(email, password) {}, // resolves to the user
  async signUp(email, password, data) {}, // the user, or null if a code must confirm it
  async sendCode(email) {},
  async verifyCode(email, code, purpose) {}, // purpose: "signIn" | "signUp" | "reset"
  async verifyLink(tokenHash, purpose) {},
  async resendCode(email, purpose) {},
  async sendResetCode(email) {},
  async updatePassword(password) {},
  async signOut() {},
  async eraseAccount() {},
  errorCode(error) {}, // "invalidEmail", "invalidCode", "weakPassword", "invalidCredentials",
  // "emailNotConfirmed", "accountExists", "rateLimited", "captcha", "network" or "unknown"
  async accountExists(email) {}, // optional: skips straight to the password or the new account
  prepare(action) {}, // optional: "signIn" | "signUp", e.g. to start a CAPTCHA early
}
```

Firebase Auth, Auth0, Clerk, Cognito or your own API all fit: the screen only ever asks for these steps. See [Sign-in](https://inglorious.dev/web/featured/sign-in).

## Analytics

```js
const adapter = {
  setConsent(isGranted) {}, // starts or stops measuring
  pageView({ route, path }) {}, // one page or screen
  event(name, params) {}, // one of the app's own events
}
```

Plausible, PostHog, Matomo or Amplitude take a few lines each. Nothing reaches the adapter before consent. See [Analytics](https://inglorious.dev/web/featured/analytics).

## Push

```js
const adapter = {
  async isSupported() {}, // whether this device can receive pushes at all
  async permission() {}, // "granted", "denied" or "prompt"
  async request() {}, // shows the system's dialog; resolves to the same
  async register() {}, // gets the device's token and stores it for the signed-in user
  onTap(listener) {}, // optional: listener(url) when a push is tapped in a native app
}
```

The token can go anywhere: `register` decides. Sending is the server's business: the generated `push-notify` function and `notifications` table are one way, any server that talks to FCM, APNs or a service like OneSignal is another. See [Push](https://inglorious.dev/web/featured/push).

## Mandatory native updates

```js
const adapter = {
  async requirement(platform) {}, // { minBuild, storeUrl } for "ios" or "android", or null
}
```

A JSON file on any host is enough. See [Native App Updates](https://inglorious.dev/web/featured/native-updates).

## Live updates

`watchLiveUpdate` reads a JSON manifest at `manifestUrl`, `{ release, minBuild, url, checksum, signature }`, and downloads the signed bundle at `url`. Any static host or CDN can serve both: `inglorious-live-update build` makes the bundle, and `publishLiveUpdate` from `@inglorious/supabase` shows how one is signed and published. See [Live Updates](https://inglorious.dev/web/featured/live-updates).

## Realtime

`withLiveReload` reloads an entity when a source says one of its tables changed. The source is an object with `subscribe(table, onChange)`, returning a stop function; `realtimeSource` is Supabase's. A WebSocket, Server-Sent Events or Firebase listeners fit the same shape. See [Decorators](https://inglorious.dev/web/advanced/decorators#withlivereload).
