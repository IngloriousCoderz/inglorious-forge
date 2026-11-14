---
title: Installation
description: Set up Inglorious Web with no build step, Vite, TypeScript, or scaffolding
---

# Installation

Get up and running with Inglorious Web in just a few commands.

## Prerequisites

- **Node.js** 26 or later
- **pnpm**

## Step 1: Choose Your Setup Path

### Recommended: Create App (Scaffolding)

Use the official scaffolding tool for the fastest setup:

```bash
pnpm create @inglorious/app
```

It asks for a template (`minimal`, `js`, `ts`, `ssx-js`, `ssx-ts`), a syntax (lit-html, JSX or Vue) and the app's features, from UI themes and routing to sign-in, push and native Android and iOS apps. Then:

```bash
cd my-app
pnpm install
pnpm dev
```

Every option, the mobile workflow and the services it uses are in the [Create App documentation](https://inglorious.dev/create-app/).

---

## Alternative Setup Options

### Option A: No Build Step (Manual)

If you prefer not to use a bundler:

```bash
pnpm add @inglorious/web
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
import { createStore } from "@inglorious/store"
import { mount, html } from "@inglorious/web"

const store = createStore({
  types: {
    App: {
      render: (entity, api) => html`<h1>Hello World</h1>`,
    },
  },
  entities: {
    app: { type: "App" },
  },
})

mount(store, (api) => api.render("app"), document.getElementById("root"))
```

**Pros:** Zero build step, instant feedback, works in any browser  
**Cons:** No TypeScript, no optimizations

### Option B: Vite (Manual)

Set up with Vite for a modern development experience:

```bash
pnpm create vite my-app --template vanilla
cd my-app
pnpm add @inglorious/web
```

Then update `main.js` with your Inglorious Web code (see Option A above).

Run `pnpm dev` and visit `http://localhost:5173`.

**Pros:** Fast HMR, TypeScript support, optimized builds  
**Cons:** Slight build complexity

### Option C: TypeScript + Vite (Manual)

For full TypeScript support:

```bash
pnpm create vite my-app --template vanilla-ts
cd my-app
pnpm add @inglorious/web
```

Create `src/types.ts`:

```typescript
import { html, type API } from "@inglorious/web"

export interface AppEntity {
  type: "App"
  message: string
}

export const App = {
  render(entity: AppEntity, api: API) {
    return html`<h1>${entity.message}</h1>`
  },
}
```

Create `src/main.ts`:

```typescript
import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { App } from "./types"

const store = createStore({
  types: { App },
  entities: {
    app: { type: "App", message: "Hello, TypeScript!" },
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
import { createStore } from "@inglorious/store"
import { mount, html } from "@inglorious/web"

const store = createStore({
  types: {
    Counter: {
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
    counter: { type: "Counter", count: 0 },
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
- **[@inglorious/create-app](https://inglorious.dev/create-app/)** — Project scaffolding

## Next Steps

- **[Quick Start](./quick-start.md)** — Build your first app
- **[Core Concepts](./core-concepts.md)** — Understand entities and types
- **[Getting Started](./getting-started.md)** — Comprehensive introduction
