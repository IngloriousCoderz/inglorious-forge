---
title: "Getting Started"
description: "Create, run and build an SSX site."
---

# Getting Started

The quickest start is the scaffolder, which sets up a site with pages, a config and the scripts below.

## Quick Start

### Installation

```bash
npm install @inglorious/ssx @inglorious/web
```

### Create Your First Site

```bash
npx @inglorious/create-app my-site --template ssx-js
cd my-site
npm run dev
```

Or manually:

### TypeScript Example

```typescript
// src/pages/index.ts
import { html } from "@inglorious/web"

// You can import API for type safety, though it's optional
// import type { API } from "@inglorious/web"

export const Index = {
  render(/* entity: any, api: API */) {
    return html`
      <div>
        <h1>Welcome to SSX!</h1>
        <p>This page was pre-rendered at build time.</p>
        <nav>
          <a href="/about">About</a>
        </nav>
      </div>
    `
  },
}
```

### JavaScript Example

```javascript
// src/pages/index.js
import { html } from "@inglorious/web"

export const Index = {
  render() {
    return html`
      <div>
        <h1>Welcome to SSX!</h1>
        <p>This page was pre-rendered at build time.</p>
        <nav>
          <a href="/about">About</a>
        </nav>
      </div>
    `
  },
}

export const metadata = {
  title: "Home",
  meta: {
    description: "Welcome to our site",
    "og:image": "/og-image.png",
  },
}
```

### Development

```bash
npm run dev
# → Dev server at http://localhost:3000
```

### Build

```bash
npm run build
# → Static site in dist/
```

### Preview

```bash
npm run preview
# → Production server at http://localhost:3000 (serves static files + API routes)
```

Or use the CLI directly:

```bash
npx ssx serve
```

Deploy `dist/` to:

- **Vercel** - Zero config
- **Netlify** - Drop folder
- **GitHub Pages** - Push and done
- **Cloudflare Pages** - Instant edge
- **Any CDN** - It's just files!

## Project Structure

```
my-site/
├── src/
│   ├── pages/          # File-based routes
│   │   ├── index.js    # Home page
│   │   ├── about.js    # About page
│   │   └── posts/
│   │       ├── index.js    # /posts
│   │       └── _id.js      # /posts/:id
│   ├── api/            # Serverless functions
│   │   └── posts.js    # /api/posts
│   ├── store/          # Store configuration
│   │   └── entities.js     # Entity definitions
│   └── types/          # Custom entity types (optional)
├── dist/               # Build output
├── package.json
└── site.config.js      # Site configuration
```
