# @inglorious/firebase

## 0.1.0

### Minor Changes

- New package: Firebase integration for Inglorious Web, in the browser and in Capacitor apps. `firebasePush` (`@inglorious/firebase/push`) is a push adapter over Firebase Cloud Messaging for `createPushPrompt`, with one token per device saved through the app's `saveToken`, and `unregister` for sign-out. `firebaseAnalytics` (`@inglorious/firebase/analytics`) is an analytics adapter over Google Analytics for Firebase for `createAnalytics`. Nothing loads in a browser before consent, advertising consents stay denied, and the native apps log a screen view on each route change.
