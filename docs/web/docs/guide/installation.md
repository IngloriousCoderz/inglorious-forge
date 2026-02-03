---
title: Installation
description: Set up Inglorious Web with no build step, Vite, TypeScript, or scaffolding
---

# Installation

Get up and running with Inglorious Web in just a few commands.

## Prerequisites

- **Node.js** 16+ or **Bun**
- **npm**, **pnpm**, or **yarn**

## Step 1: Choose Your Setup Path

### Recommended: Create App (Scaffolding)

Use the official scaffolding tool for the fastest setup:

```bash
npm create @inglorious/app@latest
```

Or with your preferred package manager:

```bash
# with yarn
yarn create @inglorious/app

# with pnpm
pnpm create @inglorious/app
```

The CLI will guide you to choose:

- **Project name**
- **Template** (minimal, js, ts, ssx-js, ssx-ts)

Then install and start developing:

```bash
cd my-app
npm install
npm run dev
```

**Best for:** Getting started quickly with a pre-configured project  
**Templates:**

- **minimal** — No bundling, just HTML/CSS/JS
- **js** — JavaScript + Vite
- **ts** — TypeScript + Vite
- **ssx-js** — Static site generation (JavaScript)
- **ssx-ts** — Static site generation (TypeScript)

---

## Alternative Setup Options

### Option A: No Build Step (Manual)

If you prefer not to use a bundler:

```bash
npm install @inglorious/web
```

Create `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

Create `main.js`:

```javascript
import { createStore, mount, html } from "@inglorious/web"

const store = createStore({
  types: {
    app: {
      render: (entity, api) => html`<h1>Hello World</h1>`,
    },
  },
  entities: {
    app: { type: "app" },
  },
})

mount(store, (api) => api.render("app"), document.getElementById("root"))
```

**Pros:** Zero build step, instant feedback, works in any browser  
**Cons:** No TypeScript, no optimizations

### Option B: Vite (Manual)

Set up with Vite for a modern development experience:

```bash
npm create vite@latest my-app -- --template vanilla
cd my-app
npm install @inglorious/web
```

Then update `main.js` with your Inglorious Web code (see Option A above).

Run `npm run dev` and visit `http://localhost:5173`.

**Pros:** Fast HMR, TypeScript support, optimized builds  
**Cons:** Slight build complexity

### Option C: TypeScript + Vite (Manual)

For full TypeScript support:

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install @inglorious/web
```

Create `src/types.ts`:

```typescript
import { html, type API } from "@inglorious/web"

export interface AppEntity {
  type: "app"
  message: string
}

export const app = {
  render(entity: AppEntity, api: API) {
    return html`<h1>${entity.message}</h1>`
  },
}
```

Create `src/main.ts`:

```typescript
import { createStore, mount } from "@inglorious/web"
import { app } from "./types"

const store = createStore({
  types: { app },
  entities: {
    app: { type: "app", message: "Hello, TypeScript!" },
  },
})

mount(store, (api) => api.render("app"), document.getElementById("root")!)
```

**Pros:** Type safety, autocomplete, IDE support  
**Cons:** Requires TypeScript knowledge

---

## Verify Installation

Create a simple test app:

```javascript
import { createStore, mount, html } from "@inglorious/web"

const store = createStore({
  types: {
    counter: {
      increment(entity) {
        entity.count++
      },
      render(entity, api) {
        return html`
          <div>
            <p>Count: ${entity.count}</p>
            <button @click=${() => api.notify("#counter:increment")}>+1</button>
          </div>
        `
      },
    },
  },
  entities: {
    counter: { type: "counter", count: 0 },
  },
})

mount(store, (api) => api.render("counter"), document.getElementById("root"))
```

If you see a counter that increments when clicked, you're all set! 🎉

## Related Packages

- **[@inglorious/store](https://npmjs.com/@inglorious/store)** — Entity-based state management (required)
- **[lit-html](https://npmjs.com/lit-html)** — DOM templating library (required)
- **[@inglorious/vite-plugin-jsx](https://npmjs.com/@inglorious/vite-plugin-jsx)** — JSX support
- **[@inglorious/vite-plugin-vue](https://npmjs.com/@inglorious/vite-plugin-vue)** — Vue template support
- **[@inglorious/create-app](https://npmjs.com/@inglorious/create-app)** — Project scaffolding

## Next Steps

- **[Quick Start](./quick-start.md)** — Build your first app
- **[Core Concepts](./core-concepts.md)** — Understand entities and types
- **[Getting Started](./getting-started.md)** — Comprehensive introduction
