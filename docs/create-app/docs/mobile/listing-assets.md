---
title: Store Listing Images
description: Screenshots and promotional images from the running app
---

# Store Listing Images

With the app running (`pnpm dev`):

```bash
pnpm mobile:listing-assets
```

It captures the screens listed in `listing.config.js` at the sizes App Store Connect and Play Console ask for, in every language, and makes the promotional images, all in `listing-assets/`. It drives your installed Chrome, so there's no browser to download.

```js
/** @type {import("@inglorious/capacitor").ListingConfig} */
export default {
  url: "http://localhost:5173",
  locales: ["en", "it"],
  localeParam: "lang",
  storage: { "app-analytics": { consent: "denied" } },

  async signIn(page, { url }) {
    await page.goto(url)
    await page.fill('input[type="email"]', "demo@example.com")
    await page.keyboard.press("Enter")
    await page.fill('input[type="password"]', "demo-password")
    await page.keyboard.press("Enter")
  },

  screens: [
    { name: "01-home", path: "/" },
    { name: "02-about", path: "/about" },
  ],

  promo: {
    tagline: { en: "Your tagline.", it: "Il tuo slogan." },
    subtitle: { en: "One line more.", it: "Una riga in più." },
  },
}
```

| Output                             | Size                 | For                                  |
| ---------------------------------- | -------------------- | ------------------------------------ |
| `iphone-6.9/<locale>/<screen>.png` | 1320×2868            | App Store, required (default)        |
| `iphone-6.3/<locale>/<screen>.png` | 1206×2622            | App Store, optional                  |
| `ipad-13/<locale>/<screen>.png`    | 2064×2752            | App Store, if the app runs on iPad   |
| `android/<locale>/<screen>.png`    | 1080×1920            | Google Play phones (default)         |
| `tablet-7`, `tablet-10`            | 1080×1920, 1440×2560 | Google Play tablets                  |
| `feature-graphic-<locale>.png`     | 1024×500             | Google Play's feature graphic        |
| `header-<locale>.png`              | 3840×1646            | A header with two framed screenshots |
| `search-results-<locale>.png`      | 1920×1280            | A card with one framed screenshot    |
| `icon-512.png`                     | 512×512              | Google Play's icon                   |

- `storage` sets `localStorage` before the app starts, so prompts such as analytics consent stay out of the shots.
- `localeParam` adds the language to each screen's address; if the app takes it from the account, choose it in `signIn`.
- `prepare` on a screen brings it to the state worth showing.

Seed the local backend with realistic demo data first: real users must never appear in store screenshots. The full options are in the [`@inglorious/capacitor` README](https://www.npmjs.com/package/@inglorious/capacitor).
