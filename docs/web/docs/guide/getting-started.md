---
title: Getting Started
description: Installation and your first Inglorious Web counter app in under 5 minutes
---

# Getting Started

Welcome to Inglorious Web! Let's build your first app in under 5 minutes.

## Installation

Install Inglorious Web using your favorite package manager:

```bash
npm install @inglorious/store
# or
yarn add @inglorious/store
# or
pnpm add @inglorious/store
```

## Your First App: A Counter

### 1. Create Your Store and Entity Type

First, define an entity type with a behavior (event handler) and a render method:

```javascript
// store.js
import { createStore, html } from "@inglorious/web"

const types = {
  counter: {
    // Event handler: mutate entity state
    increment(entity) {
      entity.value++
    },

    decrement(entity) {
      entity.value--
    },

    // Render method: return a lit-html template
    render(entity, api) {
      return html`
        <div class="counter">
          <h2>Count: ${entity.value}</h2>
          <button @click=${() => api.notify("increment")}>+1</button>
          <button @click=${() => api.notify("decrement")}>-1</button>
        </div>
      `
    },
  },
}

const entities = {
  counter: { type: "counter", value: 0 },
}

export const store = createStore({ types, entities })
```

### 2. Mount Your App

```javascript
// main.js
import { mount, html } from "@inglorious/web"
import { store } from "./store.js"

// Root render function receives the API object
const renderApp = (api) => {
  return html`
    <div class="app">
      <h1>My Counter App</h1>
      ${api.render("counter")}
    </div>
  `
}

// Mount the app to the DOM
mount(store, renderApp, document.getElementById("root"))
```

### 3. Add Some CSS

```css
body {
  font-family: sans-serif;
  padding: 2rem;
}

.app {
  max-width: 500px;
  margin: 0 auto;
}

.counter {
  border: 1px solid #ccc;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background: #0056b3;
}
```

### 4. Run Your App

If you're using Vite:

```bash
npm run dev
```

That's it! You now have a fully functional counter app.

## Key Concepts

### The `api` Object

The `api` object is your connection to the store. It provides:

- **`api.render(id)`** — Render an entity by ID
- **`api.notify(event, payload)`** — Dispatch an event
- **`api.getEntity(id)`** — Read an entity's current state
- **`api.getEntities()`** — Read all entities
- **`api.update(id, fn)`** — Sync update an entity
- **`api.dispatch(action)`** — For Redux compatibility

### Events

Events are how you trigger state changes. The event name format is:

```
[[typeName][#entityId]:][eventType]
```

Examples:

```javascript
// Broadcast event to all entities
api.notify("increment")

// Broadcast event to all entities of type "counter"
api.notify("counter:increment")

// Target a specific entity
api.notify("#counter1:increment")

// Target a specific entity of type "counter" (not really useful)
api.notify("counter#counter1:increment")

// Include a payload
api.notify("#user:setName", "Alice")

// Redux-compatible
api.dispatch({ type: "#user:setName", payload: "Alice" })
```

### The Render Method

Every entity type that wants to be rendered should have a `render(entity, api)` method that returns a lit-html template:

```javascript
const myType = {
  render(entity, api) {
    // `entity` is the current state of this entity
    // `api` is the store API for triggering events and rendering other entities

    return html`
      <div class="my-component">
        <h2>${entity.title}</h2>
        <button @click=${() => api.notify(`#${entity.id}:edit`)}>Edit</button>
      </div>
    `
  },
}
```

## Understanding the Rendering Loop

Here's what happens when you change state:

1. **Event triggered** — `api.notify("#counter:increment")`
2. **Handler runs** — `counter.increment(entity)` mutates entity state (via Mutative.js)
3. **Store notifies subscribers** — Your mount function is called
4. **Template re-renders** — `renderApp(api)` runs completely
5. **lit-html diffs** — Only changed DOM nodes update
6. **Browser displays change** — User sees the new UI

This loop repeats for every state change.

## Next Steps

Ready to dive deeper? Here are some great next topics:

- **[Core Concepts](./core-concepts.md)** — Understand entities, types, and composition
- **[Rendering Model](./rendering-model.md)** — Deep dive into how full-tree rendering works
- **[Event System](./event-system.md)** — Master the event and notification system
- **[Entity Render Methods](./entity-renders.md)** — Learn advanced rendering patterns
- **[Components Overview](../components/overview.md)** — Built-in form, table, router, and more
- **[Type Composition](../advanced/type-composition.md)** — Compose behaviors for guards, logging, analytics
- **[Testing](../advanced/testing.md)** — How to test your Inglorious Web app (spoiler: it's easy)

Happy building! 🚀
