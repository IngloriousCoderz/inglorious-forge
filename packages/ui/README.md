# @inglorious/ui

A design system for Inglorious Web with render-function components and customizable themes.

## Getting started

Import the base stylesheet (tokens + reset), pick a theme, then pull in the component styles you need:

```js
import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/data-grid.css"
```

Apply the theme classes to your root element (or any container that wraps your UI), otherwise the theme will not take effect:

```html
<body class="iw-theme-bootstrap iw-theme-light">
  <!-- Your app -->
</body>
```

If you want everything, you can import the full bundle:

```js
import "@inglorious/ui/all.css"
```

## Styles structure

The core styles live under `src/styles/`:

- `styles/reset.css`: sensible resets (box-sizing, body margin, etc.)
- `styles/tokens.css`: design tokens
- `styles/base.css`: reset + tokens (the recommended public entry)
- `styles/themes/`: built-in themes

The public CSS exports are:

- `@inglorious/ui/base.css`
- `@inglorious/ui/tokens.css`
- `@inglorious/ui/themes/inglorious.css`
- `@inglorious/ui/themes/material-ui.css`
- `@inglorious/ui/themes/material-3.css`
- `@inglorious/ui/themes/bootstrap.css`
- `@inglorious/ui/themes/ios-18.css`
- `@inglorious/ui/themes/ios-26.css`
- `@inglorious/ui/all.css`

## Icons

`Icon` draws icons from any [Iconify](https://icon-sets.iconify.design/) set as inline SVG: no icon font to load, and only the icons you import end up in the bundle. Install a set and import each icon as its own module:

```bash
pnpm add @iconify-icons/material-symbols
```

```javascript
import { Icon } from "@inglorious/ui/icon"
import arrowBack from "@iconify-icons/material-symbols/arrow-back"
import settingsOutline from "@iconify-icons/material-symbols/settings-outline"

Icon.render({ icon: settingsOutline, size: "lg" })
```

The variant is part of the name: in Material Symbols the plain name is filled and `-outline` outlined, with `-rounded` and `-sharp` styles too. Font Awesome is `@iconify-icons/fa7-solid`, `fa7-regular` and `fa7-brands`; Lucide is `@iconify-icons/lucide`. Without `icon`, `Icon` shows its `children`: an emoji, a glyph, your own SVG.

An icon is decorative unless it has a `label`, which makes it an image with that name for assistive technology.

## Right-to-left

The components mirror in a right-to-left page (`<html dir="rtl">`, which `@inglorious/i18n` sets for Arabic, Hebrew and the like): their spacing, borders and corners use logical properties, and a `left` drawer sits at the start of the line.

For your own styles, use logical properties too (`margin-inline-start`, `inset-inline-end`, `text-align: start`). For anything that moves sideways, multiply by `--iw-dir-sign`, which is `1` in left-to-right and `-1` in right-to-left:

```css
.slide-in {
  transform: translateX(calc(100% * var(--iw-dir-sign)));
}
```

Icons that point along the line, such as a back arrow or a chevron, take the `direction` of the text they sit in and are mirrored with `"rtl"`. With `@inglorious/i18n`, that is the i18n entity's `dir`:

```javascript
Icon.render({ icon: arrowBack, direction: api.getEntity("i18n").dir })
```

## Safe-area utilities

The base styles also expose CSS variables and utility classes for the system bars' insets: the notch, rounded corners, the home indicator and Android's status and navigation bars. They are in `base.css`, or on their own in `@inglorious/ui/safe-area.css`.

```css
:root {
  --safe-area-top: …;
  --safe-area-bottom: …;
  --safe-area-left: …;
  --safe-area-right: …;
}
```

They are `env(safe-area-inset-*)`, with two corrections:

- **In a Capacitor app on Android**, they use the `--safe-area-inset-*` variables Capacitor's SystemBars plugin injects. `env()` alone doubles the status bar on WebViews that Capacitor already pads natively.
- **In a browser tab, the top inset is 0.** The browser's chrome always sits between the page and the status bar, but browsers that embed a WebView can still report one (DuckDuckGo on Android reports 37px under its toolbar). The top inset applies in the installed PWA and in the native app, which `mount` from `@inglorious/web` marks with the `iw-native` class on `<html>`.

The following utility classes are available:

```css
.pt-safe {
  padding-top: var(--safe-area-top);
}
.pb-safe {
  padding-bottom: var(--safe-area-bottom);
}
.pl-safe {
  padding-left: var(--safe-area-left);
}
.pr-safe {
  padding-right: var(--safe-area-right);
}
```
