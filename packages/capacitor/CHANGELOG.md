# @inglorious/capacitor

## 0.2.0

### Minor Changes

- `inglorious-capacitor listing-assets` captures store screenshots of the running app for every store size and language from `listing.config.js`, and makes the promotional images (Google Play's feature graphic, a header and a search results card, in each language) and Google Play's 512px icon; `create-app --mobile` adds the `mobile:listing-assets` script and a starting `listing.config.js`
- `configure` removes the advertising ID permissions that Firebase Analytics merges into the Android app, so Play Console's advertising ID declaration can be "No"

## 0.1.1

### Patch Changes

- `configure` no longer rewrites `public/.well-known` files that only differ in formatting, so a formatter and `cap sync` don't undo each other.

## 0.1.0

### Minor Changes

- New package: native setup for Capacitor apps, written once in the `native` key of `package.json`. `inglorious-capacitor configure`, run as the `capacitor:sync:after` hook, writes App Links and Universal Links (intent filter, Associated Domains, `public/.well-known` files), the iOS signing team, iOS swipe back (`ios.swipeBack`), push (entitlement, background mode, AppDelegate methods), Analytics off until consent, Info.plist entries, Android permissions and the Firebase files into `android/` and `ios/`, and changes nothing when run again. `inglorious-capacitor assets` makes every icon and splash screen, light and dark, from one logo.
