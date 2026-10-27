---
title: "API Routes"
description: "Serverless functions under src/api, with the Web Fetch API."
---

# API Routes

Endpoints live beside the pages, and are served by `ssx dev`, `ssx serve` and `ssx ssr`.

## Serverless Functions

SSX supports serverless functions for dynamic API endpoints. Create files in `src/api/` that export HTTP method handlers:

```
src/api/
├── posts.js        → /api/posts
├── posts/
│   └── [id].js     → /api/posts/:id (alternative structure)
└── users.js        → /api/users
```

### Basic Example

```javascript
// src/api/posts.js
export async function GET(request) {
  const posts = [
    { id: 1, title: "Hello World" },
    { id: 2, title: "My Second Post" },
  ]

  return Response.json(posts)
}

export async function POST(request) {
  const body = await request.json()
  // Save to database...
  return Response.json({ created: body }, { status: 201 })
}
```

### Dynamic Routes

For routes like `/api/posts/:id`, export a single handler that parses the URL:

```javascript
// src/api/posts.js
import { data } from "./posts-data.js"

export async function GET(request) {
  const url = new URL(request.url)
  const segments = url.pathname.split("/").filter(Boolean)
  const id = segments[1] // /api/posts/:id

  if (id) {
    const post = data.find((post) => post.id === id)
    if (!post) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }
    return Response.json(post)
  }

  return Response.json(data)
}
```

### Using with Pages

Fetch from your API in `routeChange` for client-side navigation, and use direct imports in `load` for build-time:

```javascript
// src/pages/posts/_slug.js
import { html } from "@inglorious/web"

export const Post = {
  async routeChange(entity, { route, params }, api) {
    if (route !== entity.type) return

    const entityId = entity.id
    const response = await fetch(`/api/posts/${params.slug}`)
    const post = await response.json()
    post.body = renderMarkdown(post.body)
    api.notify(`#${entityId}:dataFetchSuccess`, post)
  },

  dataFetchSuccess(entity, post) {
    entity.post = post
  },

  render(entity) {
    return html`<h1>${entity.post?.title}</h1>`
  },
}

// Build-time: import directly (no HTTP overhead)
export async function load(entity, page) {
  const { data } = await import("../../api/posts.js")
  entity.post = data.find((p) => p.id === page.params.slug)
}
```

### Request/Response API

Handlers receive a standard Web `Request` object and should return a `Response`:

```javascript
export async function GET(request) {
  // Access request properties
  const url = new URL(request.url)
  const search = url.searchParams.get("q")
  const headers = request.headers.get("authorization")

  // Return JSON response
  return Response.json({ results: [] })

  // Or custom response
  return new Response("Not found", { status: 404 })
}
```

### Supported Methods

Export any of these HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
