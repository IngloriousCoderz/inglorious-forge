# @inglorious/capacitor

## 0.1.0

### Minor Changes

- New package: native setup for Capacitor apps, written once in the `native` key of `package.json`. `inglorious-capacitor configure`, run as the `capacitor:sync:after` hook, writes App Links and Universal Links (intent filter, Associated Domains, `public/.well-known` files), the iOS signing team, iOS swipe back (`ios.swipeBack`), push (entitlement, background mode, AppDelegate methods), Analytics off until consent, Info.plist entries, Android permissions and the Firebase files into `android/` and `ios/`, and changes nothing when run again. `inglorious-capacitor assets` makes every icon and splash screen, light and dark, from one logo.
