---
title: Getting Started
description: Build your first Inglorious Web app in under 5 minutes
---

# Getting Started

Welcome to Inglorious Web! Let's build your first app in under 5 minutes.

## Quick Start with Scaffolding

The fastest way to get started is with the official scaffolding tool:

```bash
npm create @inglorious/app@latest my-first-app
```

Follow the prompts:

- Choose a template (select **js** for this tutorial)
- Install dependencies

Then start developing:

```bash
cd my-first-app
npm install
npm run dev
```

Open your browser to `http://localhost:5173` and you'll see "Hello world, Hello wide, Hello web!" (try clicking the words!)

> **Want more control?** See the [Installation](./installation.md) guide for manual setup options (no build step, Vite, TypeScript).

## Understanding the Starter Code

The scaffolding created a simple app that demonstrates Inglorious Web's key strength: **multiple instances sharing the same behavior**.

### The Entity Type (`src/message/message.js`)

```javascript
import { html } from "@inglorious/web"

export const message = {
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  render(entity, api) {
    const who = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return html`<span @click=${() => api.notify(`#${entity.id}:click`)}
      >Hello ${who}</span
    >`
  },
}
```

This defines the **behavior** for all `message` entities:

- Click handler toggles between uppercase/lowercase
- Render method displays "Hello {who}"

### The Entity Instances (`src/store/entities.js`)

```javascript
export const entities = {
  message1: {
    type: "message",
    who: "world",
  },
  message2: {
    type: "message",
    who: "wide",
  },
  message3: {
    type: "message",
    who: "web",
  },
}
```

Here we create **three separate instances** of the `message` type, each with different data.

This is where Inglorious Web shines - creating multiple instances is just declaring more objects!

### The App (`src/app.js`)

```javascript
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`<h1>
      ${api.render("message1")}, ${api.render("message2")},
      ${api.render("message3")}!
    </h1>`
  },
}
```

The app renders all three message instances. Each one:

- Shares the same behavior (click to toggle)
- Maintains independent state (uppercase/lowercase)
- Updates independently when clicked

**Try it:** Click on different words - each maintains its own state!

## How It Works

Here's what happens when you click "world":

1. **Event triggered** — `@click` calls `api.notify("#message1:click")`
2. **Handler runs** — `message.click(entity)` toggles `message1.isUpperCase`
3. **Store notifies subscribers** — Your render function is called
4. **Full template re-renders** — `app.render(api)` runs completely
5. **lit-html diffs** — Only the changed text node updates
6. **Browser updates** — You see "world" → "WORLD" (or vice versa)

Only `message1` changed, but the entire template ran - lit-html was smart enough to update only that one word.

## Key Concepts

### Entities

Entities are plain JavaScript objects representing UI state:

```javascript
{
  id: "message1",     // From the entities object key
  type: "message",    // References the type definition
  who: "world",       // Your custom state
  isUpperCase: true   // Added by the click handler
}
```

### Types

Types define **shared behavior** for entities:

```javascript
const message = {
  // Event handler
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  // Render method
  render(entity, api) {
    return html`<span>${entity.who}</span>`
  },
}
```

Think of types as **classes** and entities as **instances**. Just remember: you'll never invoke event handlers directly — they respond to events that are notified.

### Multiple Instances

This is where Inglorious Web differs from traditional component frameworks:

**React/Vue way:**

```jsx
<Message who="world" />
<Message who="wide" />
<Message who="web" />
```

Props passed at render time, instances managed by framework.

**Inglorious Web way:**

```javascript
// Declare instances explicitly
entities: {
  message1: { type: "message", who: "world" },
  message2: { type: "message", who: "wide" },
  message3: { type: "message", who: "web" },
}

// Render by ID
html`${api.render("message1")} ${api.render("message2")}`
```

Benefits:

- ✅ All state visible in one place (the store)
- ✅ Easy to serialize/persist entire app state
- ✅ Time-travel debugging works perfectly
- ✅ Can add/remove instances dynamically

> **Most components are singletons:** In real apps, you typically only need one instance of most entities (header, footer, nav, etc.). For these cases, you can use the `autoCreateEntities` flag to automatically create singleton entities without explicitly declaring them. See [Auto-Create Entities](../advanced/auto-create.md) for details. The explicit approach shown here is useful when you genuinely need multiple instances with different data.

### The `api` Object

Your connection to the store:

- **`api.render(id)`** — Render an entity by ID
- **`api.notify(event, payload?)`** — Trigger an event
- **`api.getEntity(id)`** — Read entity state
- **`api.getEntities()`** — Read all entities

### Events

Events trigger state changes. Base format: `[#entityId:]eventName`

```javascript
// Target specific entity
api.notify("#message1:click")

// Broadcast to all entities with this handler
api.notify("click")

// With payload
api.notify("#message1:setText", "hello")
```

## Try It Yourself

Let's add a "reset all" feature.

**1. Add a reset handler to the message type** (`src/message/message.js`):

```javascript
export const message = {
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  // Add this handler
  resetAll(entity) {
    entity.isUpperCase = false
  },

  render(entity, api) {
    const who = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return html`<span @click=${() => api.notify(`#${entity.id}:click`)}
      >Hello ${who}</span
    >`
  },
}
```

**2. Add a button in the app** (`src/app.js`):

```javascript
export const app = {
  render(api) {
    return html`
      <div>
        <h1>
          ${api.render("message1")}, ${api.render("message2")},
          ${api.render("message3")}!
        </h1>
        <button @click=${() => api.notify("resetAll")}>Reset All</button>
      </div>
    `
  },
}
```

Save and watch it update! Now clicking "Reset All" broadcasts the `resetAll` event to **all three message entities**.

Notice:

- We didn't specify entity IDs in the button's `notify()`
- The event broadcasts to **all entities** that have a `resetAll` handler
- Each message entity receives the event and resets independently

## Building Without Tools (Optional)

Want to skip the build step? Create a single HTML file:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Inglorious Web Demo</title>
    <script type="importmap">
      {
        "imports": {
          "mutative": "https://unpkg.com/mutative@latest/dist/mutative.esm.mjs",
          "lit-html": "https://unpkg.com/lit-html@latest/lit-html.js",
          "lit-html/": "https://unpkg.com/lit-html@latest/",
          "@inglorious/utils/": "https://unpkg.com/@inglorious%2Futils@latest/src/",
          "@inglorious/store": "https://unpkg.com/@inglorious%2Fstore@latest/src/store.js",
          "@inglorious/store/": "https://unpkg.com/@inglorious%2Fstore@latest/src/",
          "@inglorious/web": "https://unpkg.com/@inglorious%2Fweb@latest/src/index.js"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import { createStore, mount, html } from "@inglorious/web"

      const types = {
        message: {
          click(entity) {
            entity.isUpperCase = !entity.isUpperCase
          },

          render(entity, api) {
            const who = entity.isUpperCase
              ? entity.who.toUpperCase()
              : entity.who
            return html`<span @click=${() => api.notify(`#${entity.id}:click`)}>
              Hello ${who}
            </span>`
          },
        },
      }

      const entities = {
        message1: { type: "message", who: "world" },
        message2: { type: "message", who: "wide" },
        message3: { type: "message", who: "web" },
      }

      const store = createStore({ types, entities })

      const renderApp = (api) =>
        html`<h1>
          ${api.render("message1")}, ${api.render("message2")},
          ${api.render("message3")}!
        </h1>`

      mount(store, renderApp, document.getElementById("root"))
    </script>
  </body>
</html>
```

Open this file in a browser - no build step needed!

## What Makes This Different?

Coming from React or Vue? Here's what's different:

| Concept               | React/Vue                       | Inglorious Web                 |
| --------------------- | ------------------------------- | ------------------------------ |
| Component instances   | Created implicitly at render    | Declared explicitly in store   |
| State location        | Inside components (hooks/data)  | In the store (all visible)     |
| Multiple instances    | Render component N times        | Declare N entities in store    |
| Instance identity     | Managed by framework            | You control via entity IDs     |
| State serialization   | Complex (spread across tree)    | Simple (it's just the store)   |
| Time-travel debugging | Requires special setup          | Built-in (Redux DevTools)      |
| Re-render strategy    | Selective (optimize re-renders) | Full-tree (lit-html optimizes) |

The trade-off: **Explicit instance management** for **predictable state management**.

## Next Steps

Now that you have a working app, explore these topics:

- **[Core Concepts](./core-concepts.md)** — Deep dive into entities, types, and the `api` object
- **[Rendering Model](./rendering-model.md)** — Understanding full-tree re-renders
- **[Event System](./event-system.md)** — Master event targeting and broadcasting
- **[Auto-Create Entities](../advanced/auto-create.md)** — Simplify singleton entity management
- **[Featured Types Overview](../featured/overview.md)** — Built-in router, forms, tables, and more
- **[Type Composition](../advanced/type-composition.md)** — Compose behaviors for guards and middleware
- **[Testing](../advanced/testing.md)** — How to test your app (spoiler: it's trivial)

Happy building! 🚀
