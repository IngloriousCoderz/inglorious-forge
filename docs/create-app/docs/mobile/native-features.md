---
title: Native Features
description: Native behaviours a generated app has, and the device features available as entities
---

# Native Features

## Already wired

A mobile app starts with these in `src/main`:

| Feature                                                                                                                                   | What it does                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [System bars](https://inglorious.dev/web/featured/system-bars)                                                                            | The status and navigation bars follow the theme in light and dark                          |
| [Keyboard](https://inglorious.dev/web/featured/keyboard)                                                                                  | The focused input stays above the on-screen keyboard (with `--ui`)                         |
| [Haptics](https://inglorious.dev/web/featured/haptics)                                                                                    | `haptics` plays the system's haptics through `@capacitor/haptics`, and vibrates on the web |
| [Back button](https://inglorious.dev/web/featured/back-button)                                                                            | Android's back button and gesture close the app from a top-level page (with routing)       |
| iOS swipe back                                                                                                                            | A swipe from the left edge goes back (with routing, `native.ios.swipeBack`)                |
| [App Links](https://inglorious.dev/web/featured/app-links)                                                                                | Links to the app's domain open the app (with routing)                                      |
| [Live updates](https://inglorious.dev/web/featured/live-updates) and [native updates](https://inglorious.dev/web/featured/native-updates) | With `--push`; see [App Updates](./updates.md)                                             |

## Available as entities

Device features in `@inglorious/web/device` are types like any other: an entity holds their state, events drive them, and each works in the browser and switches to a Capacitor plugin in the native app when you pass one. Install the plugin, then register the type:

```js
import { Share } from "@capacitor/share"
import { createShare } from "@inglorious/web/device/share"

const types = { Share: createShare({ plugin: Share }) }
```

| Feature                                                                        | Native plugin                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [Share](https://inglorious.dev/web/featured/share)                             | `@capacitor/share`                                                 |
| [Storage](https://inglorious.dev/web/featured/storage)                         | `@capacitor/preferences`, or the Keychain and Keystore for secrets |
| [Biometrics](https://inglorious.dev/web/featured/biometrics)                   | `@capgo/capacitor-native-biometric`                                |
| [Local notifications](https://inglorious.dev/web/featured/local-notifications) | `@capacitor/local-notifications`                                   |
| [Geolocation](https://inglorious.dev/web/featured/geolocation)                 | `@capacitor/geolocation`                                           |
| [Compass](https://inglorious.dev/web/featured/compass)                         | Browser sensors                                                    |
| [Network status](https://inglorious.dev/web/featured/network-status)           | Browser events                                                     |
| [Page visibility](https://inglorious.dev/web/featured/page-visibility)         | Browser events                                                     |
| [Media queries](https://inglorious.dev/web/featured/media-query)               | Browser events                                                     |

The camera and photo library need no plugin: a file input that accepts images offers both in the native app. Add `NSCameraUsageDescription` to `native.ios.infoPlist`, or iOS closes the app when the camera opens.

## UI primitives

Inglorious UI has the mobile pieces people expect: a bottom tab bar (`BottomNavigation`), a bottom sheet you drag to dismiss (`Dialog` with `variant="sheet"`), an action sheet, pull-to-refresh, and page transitions that slide in the direction of navigation. See [Inglorious UI](https://inglorious.dev/ui/).
