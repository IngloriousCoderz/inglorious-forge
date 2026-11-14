---
title: Mobile Overview
description: Native Android and iOS apps from the same project, with Capacitor
---

# Mobile Overview

| Question                                           | Flag                       |
| -------------------------------------------------- | -------------------------- |
| Is it a mobile app?                                | `--mobile` / `--no-mobile` |
| Build and upload store releases on GitHub Actions? | `--ci` / `--no-ci`         |

`--mobile` adds [Capacitor](https://capacitorjs.com): the web app, packaged as native Android and iOS apps. The project gets `capacitor.config.ts`, the `mobile:*` scripts, [`@inglorious/capacitor`](https://www.npmjs.com/package/@inglorious/capacitor), a `native` key in `package.json` and, with Inglorious UI, a bottom tab bar and safe-area spacing.

## Prerequisites

Native builds depend on platform tools the CLI doesn't install. If the app doesn't run after scaffolding, one of these is usually missing.

**Android**

- [Android Studio](https://developer.android.com/studio) with the Android SDK.
- A JDK that Capacitor supports. JDK 21 works reliably: prefer it over newer versions if Gradle complains.
- `JAVA_HOME` pointing to the JDK, and `ANDROID_HOME` to the SDK:

```bash
export JAVA_HOME="/path/to/jdk-21"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

**iOS**, on a Mac:

- Xcode, with its iOS platform and simulators.
- An Apple Developer team to sign with.
- On a physical iPhone, Developer Mode on, and the developer certificate trusted under **Settings → General → VPN & Device Management**.

```bash
sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

Without a Mac, [Cloud Builds](./ci.md) build and upload the iOS app on GitHub Actions.

## First run

Create the native projects once. Each starts with your logo as its icon and splash screen:

```bash
pnpm mobile:init:android
pnpm mobile:init:ios
```

Then run the app:

```bash
pnpm mobile:android        # or pnpm mobile:ios: build, sync and run
pnpm mobile:dev:android    # or pnpm mobile:dev:ios: live reload on the device
```

Commit `android/` and `ios/`. You won't need to edit them: what the app needs from them is in [Native Settings](./native-settings.md).

## What's in this section

- [Native Settings](./native-settings.md): Team ID, permissions, Info.plist, privacy manifest, from `package.json`.
- [Live Reload on a Device](./live-reload.md): see every save on the phone.
- [Icons and Splash Screens](./assets.md): all sizes from one logo.
- [Opening Links in the App](./app-links.md): Universal Links and App Links.
- [Native Features](./native-features.md): system bars, back button, swipe back, haptics, keyboard, sensors, share, storage, biometrics, notifications.
- [App Updates](./updates.md): live updates and mandatory native updates.
- [Releasing to the Stores](./releasing.md) and [Cloud Builds](./ci.md).
- [Store Requirements](./store-requirements.md) and [Store Listing Images](./listing-assets.md).
