---
title: Icons and Splash Screens
description: Every icon and splash screen from one logo
---

# Icons and Splash Screens

```bash
pnpm mobile:assets
```

It makes every icon and splash screen, in every size and density, from `public/logo.svg` or `public/logo.png`, centred on `native.assets.background` (white by default) and, for the dark splash screen, `native.assets.backgroundDark`. `pnpm mobile:init:*` already runs it for each new native project. Run it again after changing the logo, and commit the result.

```json
"native": {
  "assets": {
    "logo": "public/logo.svg",
    "background": "#f6f3ea",
    "backgroundDark": "#2b2b26",
    "iconScale": 0.6,
    "splashScale": 0.3
  }
}
```

`iconScale` and `splashScale` set the logo's width as a share of the icon (0.6) and of the splash screen (0.3). `--ios` or `--android` limits it to one platform.

The PWA's icons come from the same logo, through `@vite-pwa/assets-generator`.

## Status bar

The status bar and Android's navigation bar follow the app's theme through [`watchSystemBars`](https://inglorious.dev/web/featured/system-bars), so they stay readable in light and dark mode.
