# @inglorious/capacitor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Native project setup for [Capacitor](https://capacitorjs.com) apps, written once in `package.json` instead of clicked through Xcode and Android Studio. `@inglorious/create-app --mobile` sets it up for you.

- `inglorious-capacitor configure` writes the app's native settings into `android/` and `ios/` after every `cap sync`: App Links and Universal Links, the signing team, push, Analytics off until consent and without the advertising ID, permissions and Info.plist entries, and the Firebase files.
- `inglorious-capacitor assets` makes every icon and splash screen, light and dark, from one logo.
- `inglorious-capacitor listing-assets` captures store screenshots of the running app in every size and language, and makes the promotional images (Google Play's feature graphic, a header and a search results card) and Google Play's 512px icon.

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
    "mobile:assets": "inglorious-capacitor assets",
    "mobile:listing-assets": "inglorious-capacitor listing-assets"
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

| Setting                                       | iOS                                                                                                        | Android                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `appLinks`                                    | Associated Domains entitlement                                                                             | Verified intent filter for `paths`                             |
| `appLinks` + `teamId`                         | `public/.well-known/apple-app-site-association`                                                            |                                                                |
| `appLinks` + `sha256`                         |                                                                                                            | `public/.well-known/assetlinks.json`                           |
| `ios.teamId`                                  | `DEVELOPMENT_TEAM`, so Xcode signs without asking                                                          |                                                                |
| `ios.swipeBack`                               | A swipe from the left edge goes back: WebKit's back gesture, turned on in a generated `MainViewController` |                                                                |
| `ios.infoPlist`                               | Info.plist entries                                                                                         |                                                                |
| `ios.privacyManifest`                         | `PrivacyInfo.xcprivacy` entries, with Apple's keys                                                         |                                                                |
| `@capawesome/capacitor-live-update` installed | `PrivacyInfo.xcprivacy` declaring its use of `UserDefaults`, which it doesn't declare itself               |                                                                |
| `android.permissions`                         |                                                                                                            | `<uses-permission>` entries                                    |
| `@capacitor-firebase/messaging` installed     | Push entitlement, background mode, AppDelegate methods                                                     |                                                                |
| `@capacitor-firebase/analytics` installed     | Collection off until consent                                                                               | Collection off until consent, and no advertising ID permission |
| `GoogleService-Info.plist` in the root        | Copied into the app target                                                                                 |                                                                |
| `google-services.json` in the root            |                                                                                                            | Copied to `android/app/`                                       |
| always                                        |                                                                                                            | Keystores kept out of git                                      |

The privacy manifest is merged with the one already in the project, so entries added by hand stay. Apple refuses a build that calls a required-reason API without a declared reason; `configure` declares the ones of known plugins that ship no manifest of their own, and `ios.privacyManifest` adds the app's:

```json
"privacyManifest": {
  "NSPrivacyAccessedAPITypes": [
    {
      "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
      "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
    }
  ]
}
```

A file input that takes images (a `Button` with `accept="image/*"`) offers the camera on iOS, which closes the app unless `ios.infoPlist` has an `NSCameraUsageDescription`.

Path patterns end in `*` to match a prefix: `/jobs*` is every path that starts with `/jobs`. `exclude` takes paths and, starting with `#`, fragments; only iOS can exclude, so on Android list in `paths` only what opens the app. Serve both `.well-known` files as `application/json`.

It runs for the platform Capacitor is syncing, and changes nothing when the settings haven't changed. Commit `android/` and `ios/` as usual.

### What `assets` does

It centres the logo (`public/logo.svg` or `public/logo.png` by default) on `background` for the icons and the splash screen, and on `backgroundDark` for the dark splash screen, then hands the result to [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) for every size and density. `iconScale` and `splashScale` are the logo's width as a share of the icon and of the splash screen. Pass `--ios` or `--android` for one platform.

## Store listing images

`listing-assets` opens the running app in your installed Chrome (through `playwright-core`, so no browser download) and captures the screens listed in `listing.config.js`, once per device and language:

```js
/** @type {import("@inglorious/capacitor").ListingConfig} */
export default {
  url: "http://localhost:5173",
  locales: ["en", "it"],
  localeParam: "lang",
  storage: { "app-analytics": { consent: "denied" } },

  async signIn(page, { url }) {
    await page.goto(`${url}/login`)
    await page.fill('input[type="email"]', "demo@example.com")
    await page.keyboard.press("Enter")
    await page.fill('input[type="password"]', "demo-password")
    await page.keyboard.press("Enter")
    await page.waitForURL((address) => address.pathname !== "/login")
  },

  screens: [
    { name: "01-feed", path: "/jobs" },
    {
      name: "02-new-job",
      path: "/jobs/new",
      prepare: (page) => page.getByLabel("Title").fill("Wedding in Puglia"),
    },
  ],

  promo: {
    tagline: { en: "Can't make it?\nPass it on.", it: "Non puoi?\nPassalo." },
    subtitle: { en: "Jobs between colleagues.", it: "Lavori tra colleghi." },
    accent: "#b4532a",
  },
}
```

It writes to `listing-assets/`:

- `<device>/<locale>/<screen>.png` for each device in `devices`:

  | Device       | Size      | For                                         |
  | ------------ | --------- | ------------------------------------------- |
  | `iphone-6.9` | 1320×2868 | App Store, required (default)               |
  | `iphone-6.3` | 1206×2622 | App Store, optional                         |
  | `ipad-13`    | 2064×2752 | App Store, required if the app runs on iPad |
  | `android`    | 1080×1920 | Google Play phones (default)                |
  | `tablet-7`   | 1080×1920 | Google Play 7" tablets                      |
  | `tablet-10`  | 1440×2560 | Google Play 10" tablets                     |

- the promotional images for each locale, on `native.assets.background` unless `promo.background` says otherwise, with `promo.color`, `promo.font` and an optional `promo.accent` bar:
  - `feature-graphic-<locale>.png`, 1024×500 (Google Play): the logo beside the app's name and `promo.tagline`.
  - `header-<locale>.png`, 3840×1646: the logo, name and tagline in the middle 3:2 an iPhone shows, between two framed screenshots.
  - `search-results-<locale>.png`, 1920×1280: the logo, name, tagline and `promo.subtitle` beside one framed screenshot.

  The framed screenshots are `promo.screens` (the first two `screens` by default) from `promo.device` (the first iPhone by default).

- `icon-512.png`: Google Play's icon, made like the app icon.

`storage` sets `localStorage` before the app starts, so prompts such as analytics consent or push stay out of the shots; it can be a function of the locale. `localeParam` adds the language to each screen's address. If the app takes the language from the signed-in account instead, choose it in `signIn`. `prepare` brings a screen to the state worth showing, after it loads and settles for `settle` milliseconds (1000 by default).

Screenshots show real data, so use a demo account on a local backend with realistic seed data, never production.

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
