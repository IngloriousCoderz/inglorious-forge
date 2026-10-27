---
title: "Rendering Modes"
description: "Static generation by default, server rendering on request where a page needs it."
---

# Rendering Modes

## SSG and SSR

Every page is rendered to HTML on the server and hydrated in the browser. What changes is _when_ it is rendered:

- **Static (the default).** `ssx build` renders the page once and writes it to `dist/`. Its `load` runs at build time.
- **Server-rendered.** A page that exports `ssr` is rendered on each request, with its `load` run for that request, so it can show fresh data or vary per request:

```javascript
// src/pages/checkout.js
import { html } from "@inglorious/web"

export const ssr = true

export async function load(entity) {
  entity.checkout = await fetchCheckoutDetails()
}

export const Checkout = {
  render(entity) {
    return html`<h1>Checkout</h1>
      <p>${entity.checkout?.status}</p>`
  },
}
```

Each request gets a store of its own, so one visitor's data never reaches another's page. `load` gets the page with the `request`, a Web Fetch API `Request` like the one API routes get, to read headers and cookies from:

```javascript
export const ssr = true

export async function load(entity, page) {
  const session = page.request.headers.get("cookie")
  entity.orders = await getOrders(session)
}
```

A dynamic route that exports `ssr` needs no `staticPaths`: any path its pattern matches is a page, and `page.params` come from the URL. `src/pages/orders/_id.js` answers `/orders/42`, with `page.params.id === "42"`, and every other order alike.

### Deploying

| The site has…           | Build       | Run in production                              | Serves                                                      |
| ----------------------- | ----------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Only static pages       | `ssx build` | Any static host, or `ssx serve` for API routes | `dist/`, and `src/api/` with `ssx serve`                    |
| Pages that export `ssr` | —           | `ssx ssr`                                      | Every page, rendered on request, the API routes, and assets |

`ssx build` skips the pages that export `ssr`, and `ssx serve` only serves what the build wrote, so a site with server-rendered pages runs on `ssx ssr`. It renders every page on request, static ones included, from your sources through Vite, with no build step. In development, `ssx dev` renders every page on request as well.

A static dynamic route lists its paths with [`staticPaths`](/guide/routing#dynamic-routes-with-staticpaths), as the build has to know them; a server-rendered one does not.

## Client-Side Hydration

Pages hydrate automatically with lit-html. Interactivity works immediately:

```javascript
export const Counter = {
  click(entity) {
    entity.count++
  },

  render(entity, api) {
    return html`
      <div>
        <p>Count: ${entity.count}</p>
        <button @click=${() => api.notify(`#${entity.id}:click`)}>
          Increment
        </button>
      </div>
    `
  },
}
```

The HTML is pre-rendered on the server. When JavaScript loads, lit-html hydrates the existing DOM and wires up event handlers. No flash of unstyled content, no duplicate rendering.
