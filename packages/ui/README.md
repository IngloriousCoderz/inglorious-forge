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

The base styles also expose CSS variables and utility classes for iPhone notch and home-indicator safe areas.

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}
```

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

These are useful for mobile layouts that need to respect notches, rounded corners, and the home indicator. They are intentionally generic utilities so apps can opt into them without having to define custom safe-area values repeatedly.
