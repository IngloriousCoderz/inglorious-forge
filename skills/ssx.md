# @inglorious/ssx - Complete Reference

## Installation

```bash
npm install @inglorious/ssx @inglorious/web
```

## Core Concepts

Static Site Xecution (SSX) builds pre-rendered HTML for @inglorious/web apps, then hydrates on the client with lit-html.

**Architecture:**

- File-based routing from `src/pages/`
- Server-side rendering at build time
- Client-side hydration via @inglorious/web
- Entity-based state (same model as @inglorious/web)

## Quick Start

```bash
npx @inglorious/create-app my-site --template ssx-js
cd my-site
npm run dev
```

## File-Based Routing

Pages live in `src/pages/` (relative to the SSX root directory):

```
src/pages/
├── index.js          → /
├── about.js          → /about
├── blog.js           → /blog
└── posts/
    └── _slug.js      → /posts/:slug
```

**Dynamic routes** use an underscore prefix: `_id.js`, `_slug.js`.
**Catch-all routes** use double underscores: `__path.js` → `*`.

## Page Exports

### `render(entity, api)`

Required. Returns a lit-html template.

```javascript
import { html } from "@inglorious/web"

export const index = {
  render(entity, api) {
    return html`<h1>${entity.title}</h1>`
  },
}
```

### `metadata`

Optional. Controls the HTML `<head>`.

```javascript
export const metadata = {
  title: "Home",
  meta: {
    description: "Welcome",
    "og:image": "/og-image.png",
  },
}

export const metadata = (entity) => ({
  title: `${entity.user.name}'s Profile`,
  meta: {
    description: entity.user.bio,
  },
})
```

### `load(entity, page)`

Optional. Runs at build time for SSR data loading.

```javascript
export async function load(entity, page) {
  const response = await fetch("https://api.example.com/posts")
  entity.posts = await response.json()
}
```

For dynamic routes, use `page.params`:

```javascript
export async function load(entity, page) {
  const response = await fetch(
    `https://api.example.com/posts/${page.params.slug}`,
  )
  entity.post = await response.json()
}
```

### `staticPaths()`

Required for dynamic routes. Returns the paths to generate.

```javascript
export async function staticPaths() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json(),
  )
  return posts.map((post) => ({
    params: { slug: post.slug },
    path: `/posts/${post.slug}`,
  }))
}
```

## Entity-Based State

Pages can use entity state like @inglorious/web:

```javascript
// src/pages/about.js
import { html } from "@inglorious/web"

export const about = {
  click(entity) {
    entity.count++
  },
  render(entity, api) {
    return html`
      <h1>About</h1>
      <p>Count: ${entity.count}</p>
      <button @click=${() => api.notify(`#${entity.id}:click`)}>
        Increment
      </button>
    `
  },
}
```

```javascript
// src/store/entities.js
export const entities = {
  about: { type: "about", count: 0 },
}
```

## Client-Side Hydration & Navigation

SSX hydrates the pre-rendered HTML and wires up the @inglorious/web router.

```javascript
// Programmatic navigation
api.notify("#router:navigate", "/posts")
api.notify("#router:navigate", { to: "/posts/123", replace: true })
```

## Site Configuration

Configure SSX in `site.config.js` (or `site.config.ts`) at the project root:

```javascript
export default {
  title: "My Site",
  meta: { description: "A site built with SSX" },

  sitemap: {
    hostname: "https://mysite.com",
    filter: (page) => !page.path.startsWith("/admin"),
  },

  rss: {
    title: "My Blog",
    description: "Latest posts",
    link: "https://mysite.com",
    feedPath: "/feed.xml",
    filter: (page) => page.path.startsWith("/posts"),
  },

  markdown: {
    theme: "github-dark",
  },
}
```

## Markdown Pages

`.md` files in `src/pages/` become pages. Frontmatter becomes `metadata`.

Example:

```markdown
---
title: My Post
---

# Hello World

This is a markdown page.
```

Features:

- Code highlighting with `highlight.js`
- LaTeX math via `katex`
- Mermaid diagrams (requires client-side mermaid)

## Image Optimization

SSX integrates `vite-plugin-image-optimizer` with `sharp`/`svgo` to compress static images at build time.

## CLI Commands

### Development

```bash
npm run dev
```

Options:

- `-c, --config <file>` (default: `site.config.js`)
- `-r, --root <dir>` (default: `.`)
- `-p, --port <port>` (default: `3000`)

### Build

```bash
npm run build
```

Options:

- `-c, --config <file>`
- `-r, --root <dir>`
- `-o, --out <dir>` (default: `dist`)
- `-i, --incremental` (default: `true`)
- `-f, --force` (default: `false`)

### Preview

```bash
npm run preview
```

Serves `dist/` using `serve`.

## Rules & Constraints

1. **Pages MUST export `render`.**
2. **`load` runs at build time**, not in the browser.
3. **Dynamic routes require `staticPaths()`.**
4. **Entity state works the same as @inglorious/web.**
5. **Pages live in `src/pages/` under the root dir.**
