---
title: "Data and State"
description: "Loading a page's data, and the entities and types that hold it."
---

# Data and State

A page is an Inglorious Web type with an entity of its own, filled by its `load` on the server.

## Data Loading

Load a page's data with the `load` export: at build time for a static page, on each request for one that exports `ssr`:

```javascript
// src/pages/blog.js
import { html } from "@inglorious/web"

export const Blog = {
  render(entity) {
    return html`
      <h1>Blog Posts</h1>
      <ul>
        ${entity.posts?.map(
          (post) => html`
            <li>
              <a href="/posts/${post.id}">${post.title}</a>
            </li>
          `,
        )}
      </ul>
    `
  },
}

// Runs on the server, before the page renders
export async function load(entity) {
  const response = await fetch("https://api.example.com/posts")
  entity.posts = await response.json()
}

export const metadata = {
  title: "Blog",
}
```

The `load` function runs on the server: during the build for a static page, on every request for a server-rendered one. Its data is serialized into the HTML and available immediately on the client.

## Entity-Based State and Behavior

```javascript
// src/pages/about.js
import { html } from "@inglorious/web"

export const About = {
  click(entity) {
    entity.name += "!"
  },

  render(entity, api) {
    return html`<h1>
      About
      <span @click=${() => api.notify(`#${entity.id}:click`)}
        >${entity.name}</span
      >
    </h1>`
  },
}
```

```javascript
// src/store/entities.js
export const entities = {
  about: {
    type: "About",
    name: "Us",
  },
}
```
