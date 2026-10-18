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
- `@inglorious/ui/themes/material.css`
- `@inglorious/ui/themes/bootstrap.css`
- `@inglorious/ui/all.css`

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
