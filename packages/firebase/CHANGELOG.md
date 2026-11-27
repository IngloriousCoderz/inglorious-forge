# @inglorious/firebase

## 0.2.1

### Patch Changes

- f864aa1: Fix repository metadata and enable trusted publishing with provenance

## 0.2.0

### Minor Changes

- An app runs before its Firebase project exists. In a browser, `firebasePush` and `firebaseAnalytics` are unsupported until the web app's config is filled in, so Firebase never starts and fails no more on its first call. Analytics adapters can now have `isSupported()`: when it says `false`, `createAnalytics` never shows the consent prompt and never calls the adapter.

## 0.1.1

### Patch Changes

- Require Node 26 or later, like the rest of the suite

## 0.1.0

### Minor Changes

- New package: Firebase integration for Inglorious Web, in the browser and in Capacitor apps. `firebasePush` (`@inglorious/firebase/push`) is a push adapter over Firebase Cloud Messaging for `createPushPrompt`, with one token per device saved through the app's `saveToken`, and `unregister` for sign-out. `firebaseAnalytics` (`@inglorious/firebase/analytics`) is an analytics adapter over Google Analytics for Firebase for `createAnalytics`. Nothing loads in a browser before consent, advertising consents stay denied, and the native apps log a screen view on each route change.
