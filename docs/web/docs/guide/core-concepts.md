---
title: Core Concepts
description: Learn about entities, types, events, and the store API
---

# Core Concepts

Inglorious Web is built on a few fundamental concepts that, once understood, make everything click. Let's explore them.

## Entities

An **entity** is a JavaScript object that represents a piece of your UI state. Entities have:

- **`id`** — Unique identifier
- **`type`** — Reference to the type definition (behavior + render)
- **Custom properties** — Any state your entity needs (title, count, isOpen, etc.)

```javascript
// Entity example
const userEntity = {
  id: "user",
  type: "user",
  name: "Alice",
  email: "alice@example.com",
  isLoggedIn: true,
}
```

### Entities vs Components

| Concept        | React Component             | Inglorious Entity     |
| -------------- | --------------------------- | --------------------- |
| State location | Inside component (hooks)    | In the store          |
| Identity       | No persistent identity      | Persistent `id`       |
| Lifecycle      | Mounted/Unmounted           | Create/Destroy events |
| Props          | Passed from parent          | In entity properties  |
| Testing        | Requires test library setup | Just trigger events   |

## Types

A **type** defines the behavior and (optionally) rendering for entities of that type. Types are plain JavaScript objects with methods that act as event handlers — they get triggered when an event with the same name is notified:

```javascript
const user = {
  // Event handlers
  login(entity, { email, password }) {
    // Mutate entity state
    entity.isLoggedIn = true
    entity.email = email
  },

  logout(entity) {
    entity.isLoggedIn = false
  },

  // Render method (optional)
  render(entity, api) {
    if (entity.isLoggedIn) {
      return html`
        <div>Welcome, ${entity.name}</div>
        <button @click=${() => api.notify("#user:logout")}>Logout</button>
      `
    } else {
      return html`<button>Login</button>`
    }
  },
}
```

Think of types as classes and entities as instances of those classes. But you never invoke methods directly—instead, you notify events.

### Types vs Redux Slices

If you're familiar with Redux or Redux Toolkit, types are similar to slices with their reducers, while entities are like their `initialState`. Key differences:

- ✅ Easier to have multiple instances of the same type
- ✅ Can add and remove instances at runtime
- ✅ Can notify other events from event handlers (unlike reducers)

An event queue ensures that notifying events remains deterministic.

### Event Handler Signature

Event handlers receive up to three parameters:

```javascript
myType = {
  someEvent(entity, payload, api) {
    // entity: The entity being updated
    // payload: Optional data passed with the event
    // api: The store API (for triggering more events or accessing state)
  },
}
```

For simpler events, you can omit unused parameters:

```javascript
const counter = {
  increment(entity) {
    // Only need the entity
    entity.count++
  },

  set(entity, newValue) {
    // Need entity and payload
    entity.count = newValue
  },

  reset(entity, _, api) {
    // Need all three
    api.notify("set", 0)
  },
}
```

## Render Methods

Types are not necessarily components — they're just collections of behavior. A type that wants to be rendered provides a `render(entity, api)` method that returns a lit-html template:

```javascript
import { html } from "@inglorious/web"

const greeting = {
  render(entity, api) {
    return html`
      <div class="greeting">
        <h1>Hello, ${entity.name}!</h1>
        <p>${entity.message}</p>
      </div>
    `
  },
}
```

The render method is called whenever:

1. The store is subscribed to (initial render)
2. Any state change occurs (full-tree re-render)
3. The render method is explicitly invoked

## Render Composition

Render methods are just pure functions. You can invoke them directly:

```javascript
import { html } from "@inglorious/web"

const app = {
  render(entity, api) {
    return html`<header>${header.render({ title: "Hello" }, api)}</header>`
  },
}
```

This is similar to passing props to a component.

If there's an entity of that type in the store, you can retrieve it with the `api` object:

```javascript
import { html } from "@inglorious/web"

const app = {
  render(entity, api) {
    const headerEntity = api.getEntity("header")
    return html`<header>${header.render(headerEntity, api)}</header>`
  },
}
```

The `api` object provides a convenience method to do this more concisely:

```javascript
import { html } from "@inglorious/web"

const app = {
  render(entity, api) {
    return html`<header>${api.render("header")}</header>`
  },
}
```

This pattern is incredibly clean because:

- ✅ No prop drilling
- ✅ No parent/child coupling
- ✅ Entities communicate through events
- ✅ All state is visible in the store (no hidden state)

### Using the `api` Object

The `api` parameter provides access to store methods in both event handlers and render methods:

```javascript
const page = {
  render(entity, api) {
    // Get another entity
    const user = api.getEntity("user")

    // Get all entities
    const allEntities = api.getEntities()

    // Render another entity
    const childUI = api.render("header")

    // Notify of an event
    const handleClick = () => api.notify("click", { x: 100, y: 50 })

    return html`
      <div @click=${handleClick}>
        <header>${childUI}</header>
        <h1>Welcome, ${user.name}</h1>
      </div>
    `
  },
}
```

## Store API

The store provides these methods:

### `notify(event, payload?)`

Dispatch an event to trigger state changes:

```javascript
// Broadcast event to all entities
api.notify("globalEvent")

// Target specific entity by ID
api.notify("#user:login", { email: "alice@example.com" })

// Target all entities of a type
api.notify("todo:toggle")

// Redux-compatible dispatch
api.dispatch({ type: "#user:login", payload: { email: "alice@example.com" } })
```

### `getEntity(id)`

Read an entity's current state:

```javascript
const user = api.getEntity("user")
console.log(user.name)
```

### `getEntities(typeName?)`

Get all entities as an object (keyed by ID):

```javascript
const all = api.getEntities()
Object.values(all).forEach((entity) => console.log(entity.id))

const todos = api.getEntities("todo")
todos.forEach((todo) => console.log(todo.id))
```

### `select(selector)`

Run a selector against the current state:

```javascript
const activeFilter = (state) => state.toolbar.activeFilter
const filter = api.select(activeFilter)
```

### `render(id)`

Render an entity by ID:

```javascript
const template = api.render("user")
```

## Events and Handlers

When you notify an event, the store looks up the appropriate handlers and calls them:

```javascript
api.notify("increment", 5)

// 1. Store checks which entities listen to "increment"
// 2. For each entity, finds its type definition
// 3. Calls: increment(entity, 5, api)

api.notify("#counter:increment", 5)

// 1. Store finds entity with id "counter"
// 2. Finds type definition for that entity
// 3. Calls: increment(entity, 5, api)
```

> **Implementation note:** The store maintains an event map that tracks which entities listen to each event, so there's no lookup cost at runtime.

### Event Targeting

Events can target:

1. **Broadcast** — All entities that define the handler

```javascript
api.notify("refresh") // All entities with a "refresh" handler
```

2. **By ID** — Specific entity

```javascript
api.notify("#user:logout") // Only the "user" entity
```

3. **By Type** — All entities of one type

```javascript
api.notify("todo:toggle") // All entities of type "todo"
```

## State Mutations (via Mutative.js)

Inglorious Web uses [Mutative.js](https://mutative.js.org/) to handle immutable state safely. You write mutations that **look mutable** but produce **immutable results**:

```javascript
const todo = {
  toggle(entity) {
    // Looks like mutation
    entity.completed = !entity.completed
    // But produces immutable result under the hood
  },

  setTitle(entity, newTitle) {
    // Direct mutation syntax
    entity.title = newTitle
  },
}
```

Mutative.js handles the immutability for you, so:

- ✅ Time-travel debugging works
- ✅ Shallow comparison works for optimization
- ✅ State changes are detectable
- ✅ Redux DevTools integration works seamlessly

## Type Composition

So far we've seen types defined as objects. These are actually **behaviors**. In their simplest form, types are just behaviors. But types can also be:

- **Functions** that wrap other types
- **Arrays of behaviors** for composition

This is incredibly powerful for:

- **Guards** — Check authentication before allowing actions
- **Logging** — Log every event on an entity
- **Analytics** — Track user interactions
- **Middleware** — Intercept and modify events

```javascript
// Base behavior
const page = {
  navigate(entity, route) {
    entity.currentRoute = route
  },

  render(entity, api) {
    return html`<div>Current route: ${entity.currentRoute}</div>`
  },
}

// Guard behavior (function wrapper)
const requireAuth = (type) => ({
  navigate(entity, route, api) {
    if (!isAuthenticated()) {
      api.notify("navigate", "/login")
      return // Stop here, don't call the wrapped type
    }
    // Pass through to wrapped type
    type.navigate(entity, route, api)
  },

  // Pass through other methods
  render: type.render,
})

// Compose them as an array
const types = {
  protectedPage: [page, requireAuth],
}
```

When you dispatch `navigate` on a `protectedPage`:

1. The store processes behaviors from right to left (like middleware)
2. `requireAuth` checks authentication first
3. If authenticated, it calls the original `page.navigate`
4. If not, it redirects to login and stops

This is much cleaner than HOCs or wrapper components! It's the Decorator pattern implemented through function composition.

## Next Steps

- **[Rendering Model](./rendering-model.md)** — Deep dive into the full-tree rendering approach
- **[Event System](./event-system.md)** — Master events, targeting, and the event queue
- **[Type Composition](../advanced/type-composition.md)** — Learn advanced composition patterns
- **[Testing](../advanced/testing.md)** — How to test your entity types

Happy coding! 🚀
