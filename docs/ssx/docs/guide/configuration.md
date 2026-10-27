---
title: "Configuration"
description: "Site configuration, environment variables, the 404 page and incremental builds."
---

# Configuration

SSX works without configuration; `site.config.js` changes the defaults.

## Site Configuration

Customize SSX behavior in `src/site.config.js`:

```javascript
export default {
  // Basic metadata
  lang: "en",
  charset: "UTF-8",
  title: "My Awesome Site",
  meta: {
    description: "A site built with SSX",
    "og:type": "website",
  },

  // Global assets
  prescripts: ["./gdpr.js"], // loaded first in <head>, before any other script (e.g. cookie consent)
  styles: ["./styles/reset.css", "./styles/theme.css"],
  scripts: ["./scripts/analytics.js"],

  // Build options
  basePath: "/",
  rootDir: "src",
  outDir: "dist",
  publicDir: "public",
  favicon: "/favicon.ico",

  // Router config
  router: {
    trailingSlash: false,
    scrollBehavior: "smooth",
  },

  // i18n routing
  i18n: {
    defaultLocale: "en",
    locales: ["en", "it", "pt"],
  },

  // Vite config passthrough
  vite: {
    server: {
      port: 3000,
      open: true,
    },
  },

  // Build hooks
  hooks: {
    beforeBuild: async (config) => console.log("Starting build..."),
    afterBuild: async (result) => console.log(`Built ${result.pages} pages`),
  },
}
```

## Environment Variables

Use Vite's environment variables:

```javascript
// Access in your code
const apiUrl = import.meta.env.VITE_API_URL

// .env file
VITE_API_URL=https://api.example.com
```

## Custom 404 Page

Create a fallback route:

```javascript
// src/pages/404.js
export const NotFound = {
  render() {
    return html`
      <div>
        <h1>404 - Page Not Found</h1>
        <a href="/">Go Home</a>
      </div>
    `
  },
}

export const metadata = {
  title: "404",
}
```

Register it in your router:

```javascript
// src/store/entities.js
import { setRoutes } from "@inglorious/web/router"

setRoutes({
  // ... other routes
  "*": "notFound", // Fallback
})
```

## Incremental Builds

SSX enables incremental builds by default. Only changed pages are rebuilt, dramatically speeding up your build process:

```bash
ssx build
# Only changed pages are rebuilt

ssx build --force
# Force a clean rebuild of all pages
```

Incremental builds respect your page dependencies and invalidate the cache when dependencies change.

## Component Compatibility

### Fully Supported

- All Inglorious Web built-in types (`form`, `router`)
- All [Inglorious UI](https://inglorious.dev/ui) primitives (controls, data display, navigation, feedback, layout, surfaces)
- Custom components using lit-html templates
- Plain HTML and CSS

### Limited Support

- Third-party Web Components (Shoelace, Material Web, etc.)
  - Will not appear in pre-rendered HTML
  - Require client-side JavaScript to initialize
  - Best used for client-only interactive features
  - Consider using Inglorious Web components for SSG content
