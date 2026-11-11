# @inglorious/capacitor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Native project setup for [Capacitor](https://capacitorjs.com) apps, written once in `package.json` instead of clicked through Xcode and Android Studio. `@inglorious/create-app --mobile` sets it up for you.

- `inglorious-capacitor configure` writes the app's native settings into `android/` and `ios/` after every `cap sync`: App Links and Universal Links, the signing team, push, Analytics off until consent, permissions and Info.plist entries, and the Firebase files.
- `inglorious-capacitor assets` makes every icon and splash screen, light and dark, from one logo.

## Installation

```bash
pnpm add -D @inglorious/capacitor
```

Run `configure` as Capacitor's `sync` hook, so `cap add` and `cap sync` both apply the settings:

```json
{
  "scripts": {
    "capacitor:sync:after": "inglorious-capacitor configure",
    "mobile:init:ios": "cap add ios && inglorious-capacitor assets --ios",
    "mobile:init:android": "cap add android && inglorious-capacitor assets --android",
    "mobile:assets": "inglorious-capacitor assets"
  }
}
```

## Settings

The `native` key of `package.json` holds them all. Every key is optional; the app's id comes from `capacitor.config.ts`.

```json
{
  "native": {
    "appLinks": {
      "domain": "app.example.com",
      "paths": ["/", "/jobs*"],
      "exclude": ["#*access_token*", "/onboarding*"]
    },
    "ios": {
      "teamId": "ABCDE12345",
      "swipeBack": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSMicrophoneUsageDescription": "Records the voice message for your job."
      }
    },
    "android": {
      "sha256": ["C1:0B:…:07"],
      "permissions": ["android.permission.RECORD_AUDIO"]
    },
    "assets": {
      "logo": "public/logo.svg",
      "background": "#f6f3ea",
      "backgroundDark": "#2b2b26",
      "iconScale": 0.6,
      "splashScale": 0.3
    }
  }
}
```

### What `configure` does

| Setting                                   | iOS                                                                                                        | Android                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `appLinks`                                | Associated Domains entitlement                                                                             | Verified intent filter for `paths`   |
| `appLinks` + `teamId`                     | `public/.well-known/apple-app-site-association`                                                            |                                      |
| `appLinks` + `sha256`                     |                                                                                                            | `public/.well-known/assetlinks.json` |
| `ios.teamId`                              | `DEVELOPMENT_TEAM`, so Xcode signs without asking                                                          |                                      |
| `ios.swipeBack`                           | A swipe from the left edge goes back: WebKit's back gesture, turned on in a generated `MainViewController` |                                      |
| `ios.infoPlist`                           | Info.plist entries                                                                                         |                                      |
| `android.permissions`                     |                                                                                                            | `<uses-permission>` entries          |
| `@capacitor-firebase/messaging` installed | Push entitlement, background mode, AppDelegate methods                                                     |                                      |
| `@capacitor-firebase/analytics` installed | Collection off until consent                                                                               | Collection off until consent         |
| `GoogleService-Info.plist` in the root    | Copied into the app target                                                                                 |                                      |
| `google-services.json` in the root        |                                                                                                            | Copied to `android/app/`             |
| always                                    |                                                                                                            | Keystores kept out of git            |

Path patterns end in `*` to match a prefix: `/jobs*` is every path that starts with `/jobs`. `exclude` takes paths and, starting with `#`, fragments; only iOS can exclude, so on Android list in `paths` only what opens the app. Serve both `.well-known` files as `application/json`.

It runs for the platform Capacitor is syncing, and changes nothing when the settings haven't changed. Commit `android/` and `ios/` as usual.

### What `assets` does

It centres the logo (`public/logo.svg` or `public/logo.png` by default) on `background` for the icons and the splash screen, and on `backgroundDark` for the dark splash screen, then hands the result to [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) for every size and density. `iconScale` and `splashScale` are the logo's width as a share of the icon and of the splash screen. Pass `--ios` or `--android` for one platform.

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
