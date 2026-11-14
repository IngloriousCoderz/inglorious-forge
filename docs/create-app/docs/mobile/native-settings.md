---
title: Native Settings
description: The native projects configured from package.json
---

# Native Settings

Leave `android/` and `ios/` to the tools. What the app needs from them is in `native` in `package.json`, and `inglorious-capacitor configure` writes it into both projects after every `cap sync` (it runs as Capacitor's `capacitor:sync:after` hook). It changes nothing when the settings haven't changed, so it's safe to run any number of times.

```json
{
  "native": {
    "appLinks": {
      "domain": "app.example.com",
      "paths": ["/", "/jobs*"],
      "exclude": ["#*access_token*"]
    },
    "ios": {
      "teamId": "ABCDE12345",
      "swipeBack": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "Takes the photo for your profile."
      },
      "privacyManifest": {}
    },
    "android": {
      "sha256": ["C1:0B:…:07"],
      "permissions": ["android.permission.RECORD_AUDIO"]
    },
    "assets": {
      "background": "#ffffff",
      "backgroundDark": "#121212"
    }
  }
}
```

| Setting               | What it does                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `ios.teamId`          | Your Apple Developer Team ID, so Xcode signs the app without asking                               |
| `ios.infoPlist`       | Info.plist entries, such as the text iOS shows when the app asks for the camera or the microphone |
| `ios.swipeBack`       | A swipe from the left edge goes back (on with routing)                                            |
| `ios.privacyManifest` | Entries for `PrivacyInfo.xcprivacy`, with Apple's keys                                            |
| `android.permissions` | `<uses-permission>` entries                                                                       |
| `android.sha256`      | The fingerprints of your signing keys, for [App Links](./app-links.md)                            |
| `appLinks`            | [Opening links in the app](./app-links.md)                                                        |
| `assets`              | [Icons and splash screens](./assets.md)                                                           |

`ITSAppUsesNonExemptEncryption: false` tells App Store Connect the app uses no encryption beyond HTTPS: remove it if that stops being true.

A file input that takes images offers the camera on iOS, which closes the app unless `ios.infoPlist` has an `NSCameraUsageDescription`.

## Set from the dependencies

Some settings follow from what the app installs, with nothing to write:

| Installed                              | iOS                                                    | Android                                         |
| -------------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `@capacitor-firebase/messaging`        | Push entitlement, background mode, AppDelegate methods |                                                 |
| `@capacitor-firebase/analytics`        | Collection off until consent                           | Collection off until consent, no advertising ID |
| `@capawesome/capacitor-live-update`    | Its `UserDefaults` use in the privacy manifest         |                                                 |
| `GoogleService-Info.plist` in the root | Copied into the app target                             |                                                 |
| `google-services.json` in the root     |                                                        | Copied to `android/app/`                        |

Keystores are kept out of git in every project. The full list is in the [`@inglorious/capacitor` README](https://www.npmjs.com/package/@inglorious/capacitor).
