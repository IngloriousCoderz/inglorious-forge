---
title: "SSX: Pre-rendered Sites"
description: "Render Inglorious Web apps on the server, at build time or on each request, with @inglorious/ssx."
---

# SSX: Pre-rendered Sites

**[@inglorious/ssx](https://npmjs.com/package/@inglorious/ssx)** renders Inglorious Web apps to HTML on the server, then hydrates them in the browser. It has [docs of its own](https://inglorious.dev/ssx/); this page is how it fits with what you know from Inglorious Web.

## The same types, rendered on the server

A page is a file in `src/pages/` that exports an Inglorious Web type, and its entity is filled by its `load` on the server:

```javascript
// src/pages/posts/_id.js
import { html } from "@inglorious/web"

export const ssr = true

export async function load(entity, page) {
  entity.post = await getPost(page.params.id)
}

export const Post = {
  render(entity) {
    return html`<article>
      <h1>${entity.post.title}</h1>
      <div>${entity.post.body}</div>
    </article>`
  },
}
```

The HTML arrives rendered; when the JavaScript loads, the page becomes the same store-driven app as any other, with client-side navigation between pages.

## Static or rendered on request

- **Static, the default:** `ssx build` renders each page once to `dist/`, for any static host. A dynamic route lists its paths with `staticPaths`.
- **On request:** a page that exports `ssr` is rendered for each request, with its `load` given the URL's `params` and the `request`, to read headers and cookies from. `ssx ssr` serves such a site.

Both can live in one site, beside API routes in `src/api/`.

## Get started

```bash
npm create @inglorious/app@latest -- my-site --template=ssx-js
cd my-site
npm run dev
```

Add `--syntax=jsx` or `--syntax=vue` to write the pages in JSX or Vue-like templates.

Next: the [SSX guide](https://inglorious.dev/ssx/guide/getting-started), and its [rendering modes](https://inglorious.dev/ssx/guide/rendering-modes).
