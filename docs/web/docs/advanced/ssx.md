---
title: SSX & Static Site Generation
description: Static site generation with pre-rendering and client-side hydration
---

# SSX & Static Site Generation

For building static HTML sites with pre-rendering and client-side hydration, use **[@inglorious/ssx](https://npmjs.com/@inglorious/ssx)**.

## What is SSX?

**Static Site Xecution (SSX)** is a static site generator built on Inglorious Web. It combines:

- **Pre-rendered HTML** for SEO and fast initial loads
- **Client-side hydration** for interactivity
- **File-based routing** for simplicity
- **Entity-based patterns** for consistency
- **Automatic code splitting** for performance
- **Sitemap and RSS** generation

## When to Use SSX

✅ **Perfect for:**

- Blogs and documentation sites
- Marketing pages
- Portfolio sites
- Content-heavy sites
- Sites with pre-rendered static content
- Projects that want consistency with Inglorious Web apps

❌ **Not ideal for:**

- Real-time applications (stock tickers, live chat)
- Heavy server-side logic needed
- Dynamic content on every page
- User-generated content at scale

## Quick Start

```bash
npm create @inglorious/create-app@latest -- --template ssx-js
# or with TypeScript
npm create @inglorious/create-app@latest -- --template ssx-ts
```

## Key Features

### File-Based Routing

```
pages/
├── index.js       → /
├── about.js       → /about
├── blog/
│   ├── index.js   → /blog
│   ├── [id].js    → /blog/:id
│   └── post.js    → /blog/post
```

### Pre-Rendered HTML

Every page is generated as static HTML at build time:

```bash
npm run build
# Generates:
# dist/index.html
# dist/about/index.html
# dist/blog/index.html
# dist/blog/post-1/index.html
# ...
```

### Client Hydration

HTML is interactive after JavaScript loads:

1. Server renders HTML (fast)
2. JavaScript loads (background)
3. App hydrates (becomes interactive)

### Automatic Sitemap

```bash
# Generates dist/sitemap.xml automatically
```

### RSS Feed

```bash
# Generates dist/feed.xml for subscriptions
```

## Example: Blog Site

### Page Component

```javascript
// pages/blog/[id].js
import { html } from "@inglorious/web"
import { getPost, getAllPosts } from "../api/posts"

export const page = {
  async create(entity, api) {
    const { id } = entity.params
    // In create(), it's safe to await and update since create() runs
    // before the component is mounted to the DOM
    try {
      entity.post = await getPost(id)
      entity.loading = false
    } catch (error) {
      entity.error = error.message
      entity.loading = false
    }
  },

  render(entity, api) {
    if (!entity.post) {
      return html`<h1>Loading...</h1>`
    }

    return html`
      <article>
        <h1>${entity.post.title}</h1>
        <p>By ${entity.post.author}</p>
        <div>${entity.post.content}</div>
      </article>
    `
  },
}

// Generate static pages for all posts
export async function* generate() {
  const posts = await getAllPosts()
  for (const post of posts) {
    yield {
      id: post.id,
    }
  }
}
```

### Build Output

```
dist/blog/
├── my-first-post/index.html
├── another-post/index.html
├── third-post/index.html
```

## Comparison: SSX vs Traditional Approaches

| Feature              | SSX            | Next.js  | Astro      | Hugo   |
| -------------------- | -------------- | -------- | ---------- | ------ |
| Framework            | Inglorious Web | React    | Astro      | None   |
| Pre-rendering        | ✅ Yes         | ✅ Yes   | ✅ Yes     | ✅ Yes |
| Client interactivity | ✅ Full        | ✅ Full  | ✅ Partial | ❌ No  |
| Entity-based state   | ✅ Yes         | ❌ No    | ❌ No      | ❌ No  |
| Learning curve       | Low            | Medium   | Medium     | Low    |
| Bundle size          | Small          | Large    | Small      | N/A    |
| JavaScript           | Optional       | Required | Optional   | No     |

## Advanced SSX Features

### Incremental Static Generation

Regenerate only changed pages:

```javascript
export async function* generate() {
  // Only regenerate this page every hour
  yield {
    id: "homepage",
    revalidate: 3600,
  }
}
```

### Dynamic Routes

Generate pages for dynamic data:

```javascript
export async function* generate() {
  const posts = await fetchPosts()
  for (const post of posts) {
    yield {
      id: post.slug,
      // Generate nested routes
      nested: [
        { route: "edit", id: `${post.slug}-edit` },
        { route: "preview", id: `${post.slug}-preview` },
      ],
    }
  }
}
```

### Custom Metadata

```javascript
export const metadata = {
  title: "My Blog",
  description: "A blog about web development",
  image: "/og-image.png",
  twitterCard: "summary_large_image",
}
```

## Performance Benefits

### Time to First Paint (TTFP)

- **Traditional SPA:** 1-2 seconds (load JS, render)
- **SSG with SSX:** 200-400ms (pre-rendered HTML)

### Search Engine Optimization (SEO)

- **SPA:** Content not visible to crawlers until JS runs
- **SSG:** Full HTML content visible immediately

### Bandwidth

- **SPA:** Full app bundle for every user
- **SSG:** Only HTML + minimal JavaScript

## Deployment

SSX sites are static files — deploy anywhere:

```bash
# Vercel
npm install -D @vercel/cli
vercel

# Netlify
npm install -D netlify-cli
netlify deploy --prod --dir=dist

# GitHub Pages
# Push dist/ to gh-pages branch
```

## Related

- **[Inglorious Web](../guide/getting-started.md)** — Learn the entity-based patterns
- **[Featured types](../featured/overview.md)** — Use all Inglorious Web's featured types in SSX
- **[@inglorious/ssx Docs](https://npmjs.com/@inglorious/ssx)** — Full SSX documentation

## Next Steps

Get started:

```bash
npm create @inglorious/create-app@latest my-blog -- --template ssx-ts
cd my-blog
npm run dev
```

Happy static site building! 🚀
