# @inglorious/ssx - Complete Reference

## Installation

```bash
npm install @inglorious/ssx @inglorious/web
```

## Core Concepts

Static Site Generator for `@inglorious/web`. Generates pre-rendered HTML with client-side hydration using lit-html.

**Architecture:**
- File-based routing (pages in `src/pages/`)
- Server-side rendering at build time
- Client-side hydration with lit-html
- Entity-based state (same as @inglorious/web)

## Quick Start

### Create Project

```bash
npx @inglorious/create-app my-site --template ssx-js
cd my-site
npm run dev
```

### Basic Page

```javascript
// src/pages/index.js
import { html } from "@inglorious/web"

export const index = {
  render() {
    return html`
      <div>
        <h1>Welcome to SSX!</h1>
        <p>This page was pre-rendered at build time.</p>
      </div>
    `
  },
}

export const metadata = {
  title: "Home",
  meta: {
    description: "Welcome to our site",
  },
}
```

## File-Based Routing

Pages are files in `src/pages/`:

```
src/pages/
├── index.js          → /
├── about.js          → /about
├── blog.js           → /blog
└── posts/
    └── _slug.js      → /posts/:slug
```

**Dynamic routes** use underscore prefix: `_id.js`, `_slug.js`, etc.

## Page Exports

### `render(entity, api)`

Required. Returns lit-html template:

```javascript
export const index = {
  render(entity, api) {
    return html`<h1>${entity.title}</h1>`
  },
}
```

### `metadata`

Optional. Page metadata for HTML `<head>`:

```javascript
// Static metadata
export const metadata = {
  title: "Home",
  meta: {
    description: "Welcome",
    "og:image": "/og-image.png",
  },
}

// Dynamic metadata (function)
export const metadata = (entity) => ({
  title: `${entity.user.name}'s Profile`,
  meta: {
    description: entity.user.bio,
  },
})
```

### `load(entity, page)`

Optional. Load data at build time (SSR):

```javascript
export async function load(entity, page) {
  const response = await fetch("https://api.example.com/posts")
  entity.posts = await response.json()
}
```

For dynamic routes, `page.params` contains route parameters:

```javascript
// src/pages/posts/_slug.js
export async function load(entity, page) {
  const response = await fetch(
    `https://api.example.com/posts/${page.params.slug}`
  )
  entity.post = await response.json()
}
```

### `staticPaths()`

Required for dynamic routes. Returns array of paths to generate:

```javascript
export async function staticPaths() {
  const response = await fetch("https://api.example.com/posts")
  const posts = await response.json()
  
  return posts.map((post) => ({
    params: { slug: post.slug },
    path: `/posts/${post.slug}`,
  }))
}
```

## Entity-Based State

Pages can use entity-based state like regular @inglorious/web:

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
  about: {
    type: "about",
    count: 0,
  },
}
```

## Client-Side Navigation

After hydration, navigation is instant:

```javascript
// Links navigate without page reload
<a href="/about">About</a>

// Programmatic navigation
api.notify("navigate", "/posts")
api.notify("navigate", { to: "/posts/123", replace: true })
```

Routes are lazy-loaded on demand.

## Site Configuration

Configure SSX in `src/site.config.js`:

```javascript
export default {
  // Basic metadata
  title: "My Site",
  meta: {
    description: "A site built with SSX",
  },
  
  // Sitemap configuration
  sitemap: {
    hostname: "https://mysite.com",
    filter: (page) => !page.path.startsWith("/admin"),
  },
  
  // RSS configuration
  rss: {
    title: "My Blog",
    description: "Latest posts",
    link: "https://mysite.com",
    feedPath: "/feed.xml",
    filter: (page) => page.path.startsWith("/posts"),
  },
  
  // Markdown configuration
  markdown: {
    theme: "github-dark", // Syntax highlighting theme
  },
}
```

## Markdown Pages

SSX treats `.md` files as pages:

```markdown
---
title: My Post
---

# Hello World

This is a markdown page.
```

**Features:**
- Frontmatter exported as `metadata`
- Code highlighting with `highlight.js`
- LaTeX math support via `katex`
- Mermaid diagrams (requires client-side mermaid.js)

## Image Optimization

SSX includes built-in image optimization:

- Automatic compression (PNG, JPEG, GIF, SVG, WebP, AVIF)
- Configurable via Vite config in `site.config.js`

## CLI Commands

### Development

```bash
npm run dev
# or
pnpm ssx dev
```

Options:
- `-c, --config <file>` - Config file (default: "site.config.js")
- `-r, --root <dir>` - Source root (default: "src")
- `-p, --port <port>` - Dev server port (default: 3000)

### Build

```bash
npm run build
# or
pnpm ssx build
```

Options:
- `-c, --config <file>` - Config file
- `-r, --root <dir>` - Source root
- `-o, --out <dir>` - Output directory (default: "dist")
- `-i, --incremental` - Enable incremental builds (default: true)
- `-f, --force` - Force clean build

### Preview

```bash
npm run preview
```

Serves built static site on port 3000.

## Deployment

Deploy `dist/` directory to:

- **Vercel** - Zero config
- **Netlify** - Drop folder
- **GitHub Pages** - Push and done
- **Cloudflare Pages** - Instant edge
- **Any CDN** - It's just static files

## Rules & Constraints

1. **Pages MUST export `render` function** - Returns lit-html template
2. **Metadata can be object or function** - Function receives entity for dynamic metadata
3. **`load` runs at build time** - Not on client, use for SSR data fetching
4. **`staticPaths` required for dynamic routes** - Returns array of paths to generate
5. **Entity state works same as @inglorious/web** - Use `api.notify()` for state changes
6. **Navigation is client-side after hydration** - Links use client-side routing
7. **Markdown frontmatter becomes metadata** - YAML frontmatter in `.md` files

## Common Pitfalls

### ❌ Wrong: Using load() for client-side data
```javascript
export async function load(entity) {
  // Wrong - load() runs at build time, not on client
  const data = await fetch("/api/data") // This won't work on client
  entity.data = data
}
```

### ✅ Correct: Use load() for build-time data, handlers for client data
```javascript
// Build-time data
export async function load(entity) {
  const data = await fetch("https://api.example.com/data")
  entity.data = await data.json()
}

// Client-side data
export const page = {
  async refreshData(entity, _, api) {
    const data = await fetch("/api/data")
    entity.data = await data.json()
  },
}
```

### ❌ Wrong: Missing staticPaths for dynamic route
```javascript
// src/pages/posts/_slug.js
export const post = {
  render(entity) {
    return html`<h1>${entity.post.title}</h1>`
  },
}
// Wrong - missing staticPaths(), route won't be generated
```

### ✅ Correct: Export staticPaths()
```javascript
export async function staticPaths() {
  const posts = await fetch("https://api.example.com/posts").then(r => r.json())
  return posts.map(post => ({
    params: { slug: post.slug },
    path: `/posts/${post.slug}`,
  }))
}
```

