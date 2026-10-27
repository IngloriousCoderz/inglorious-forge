---
title: "Routing"
description: "File-based routes, dynamic routes, and navigation between pages."
---

# Routing

Pages are files: their paths are their routes.

## File-Based Routing

Your file structure defines your routes:

```
src/pages/
├── index.js          → /
├── about.js          → /about
├── blog.js           → /blog
└── posts/
    └── _slug.js      → /posts/:slug
```

Dynamic routes use underscore prefix: `_id.js`, `_slug.js`, etc.

## Dynamic Routes with `staticPaths`

Generate multiple pages from data:

```javascript
// src/pages/posts/_slug.js
import { html } from "@inglorious/web"

export const Post = {
  render(entity) {
    return html`
      <article>
        <h1>${entity.post.title}</h1>
        <div>${entity.post.body}</div>
      </article>
    `
  },
}

// Load data for a specific post
export async function load(entity, page) {
  const response = await fetch(
    `https://api.example.com/posts/${page.params.slug}`,
  )
  entity.post = await response.json()
}

// Tell SSX which pages to generate
export async function staticPaths() {
  const response = await fetch(`https://api.example.com/posts`)
  const posts = await response.json()

  return posts.map((post) => ({
    params: { slug: post.slug },
    path: `/posts/${post.slug}`,
  }))
}

export const metadata = (entity) => ({
  title: entity.post?.title ?? "Post",
  meta: {
    description: entity.post?.excerpt,
  },
})
```

## Client-Side Navigation

After hydration, navigation is instant:

```javascript
// Links navigate without page reload
;<a href="/about">About</a> // Client-side routing

// Programmatic navigation
api.notify("navigate", "/posts")

// With options
api.notify("navigate", {
  to: "/posts/123",
  replace: true,
})
```

Routes are lazy-loaded on demand, keeping initial bundle size small.
