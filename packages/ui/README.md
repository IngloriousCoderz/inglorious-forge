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
