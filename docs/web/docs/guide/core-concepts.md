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
- **`state`** — Custom properties (title, count, isOpen, etc.)

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
| Testing        | Requires `@testing-library` | Just trigger events   |

## Types

A **type** defines the behavior and (optional) rendering for entities of that type. Types are plain JavaScript objects with methods:

```javascript
const user = {
  // Event handlers (methods)
  login(entity, { email, password }) {
    // Mutate entity state
    entity.isLoggedIn = true
    entity.email = email
  },

  logout(entity) {
    entity.isLoggedIn = false
  },

  // Render method (required)
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

### Method Signatures

Event handlers receive three parameters:

```javascript
myType = {
  someEvent(entity, payload, api) {
    // entity: The entity being updated
    // payload: Data passed with the event
    // api: The store API (optional, for triggering more events)
  },
}
```

For simpler events, you can omit unused parameters:

```javascript
const counter = {
  increment(entity) {
    // If you only need the entity
    entity.count++
  },

  set(entity, newValue) {
    // If you need payload
    entity.count = newValue
  },

  log(entity, payload, api) {
    // If you need all three
    console.log(`Entity ${entity.id} with payload:`, payload)
  },
}
```

Please note that, although they look like methods, they should never be invoked directly. Event handlers respond to an event that was notified.

## Render Methods

Every type that wants to be rendered needs a `render(entity, api)` method that returns a lit-html template:

```javascript
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

1. The store subscribes (initial render)
2. Any state change occurs (full-tree re-render)
3. The component is explicitly re-rendered

### Using the API in Render

The `api` parameter provides access to store methods:

```javascript
const page = {
  render(entity, api) {
    // Get another entity
    const user = api.getEntity("user")

    // Get all entities
    const allEntities = api.getEntities()

    // Render another entity
    const childUI = api.render("header")

    // Trigger an event
    const handleClick = () => api.notify("#page:clicked", { x: 100, y: 50 })

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
// Broadcast event
api.notify("globalEvent")

// Target specific entity
api.notify("#user:login", { email: "alice@example.com" })

// Redux-compatible
api.dispatch({ type: "#user:login", payload: { email: "alice@example.com" } })
```

### `getEntity(id)`

Read an entity's current state:

```javascript
const user = api.getEntity("user")
console.log(user.name)
```

### `getEntities()`

Get all entities:

```javascript
const all = api.getEntities()
Object.values(all).forEach((entity) => console.log(entity.id))
```

### `render(id)`

Render an entity by ID:

```javascript
const template = api.render("user")
```

## Events and Handlers

When you dispatch an event, the store looks up the appropriate handler and calls it:

```javascript
// Dispatch
api.notify("#counter:increment", 5)

// Store finds:
// 1. Entity with id "counter"
// 2. Type definition for that entity
// 3. Handler "increment" on the type
// 4. Calls: counter.increment(entity, 5, api)
```

### Event Types

Events can target:

1. **Broadcast** — All entities of a type

   ```javascript
   api.notify("refresh") // All entities listen
   ```

2. **By ID** — Specific entity

   ```javascript
   api.notify("#user:logout")
   ```

3. **By Type** — All of one type

   ```javascript
   api.notify("todo:toggle") // All todos listen
   ```

4. **By Type and ID** — Not really useful
   ```javascript
   api.notify("todo#myTodo:toggle")
   ```

## The Render Method and API Object Pattern

The most powerful pattern in Inglorious Web is passing the `api` object through render functions:

```javascript
// Parent render
const parent = {
  render(entity, api) {
    return html`
      <div class="parent">
        ${api.render("header")}
        <!-- Render child -->
      </div>
    `
  },
}

// Child can use the same API
const header = {
  render(entity, api) {
    return html`
      <header @click=${() => api.notify("#page:refresh")}>
        <!-- Child can trigger parent events -->
      </header>
    `
  },
}
```

This pattern is incredibly clean because:

- ✅ No prop drilling
- ✅ No parent/child coupling
- ✅ Components can communicate through events
- ✅ All state is visible in store (no hidden state)

## State Mutations (via Mutative.js)

Inglorious Web uses [Mutative.js](https://mutative.js.org/) to handle immutable state safely. You write mutations that **look mutable** but produce **immutable results**:

```javascript
const todo = {
  toggle(entity) {
    // Looks like mutation
    entity.completed = !entity.completed
    // But is actually immutable under the hood
  },

  setTitle(entity, newTitle) {
    // Direct mutation syntax
    entity.title = newTitle
  },
}
```

Mutative.js handles the immutability for you, so:

- ✅ Time-travel debugging works
- ✅ React re-renders when needed
- ✅ Shallow comparison works for memoization
- ✅ State changes are detectable

## Composition Pattern

Types can be composed as arrays of behaviors. This is incredibly powerful for:

- **Guards** (check authentication before allowing navigation)
- **Logging** (log every event on an entity)
- **Analytics** (track user interactions)
- **Middleware** (intercept and modify events)

```javascript
// Base type
const page = {
  navigate(entity, route) {
    entity.currentRoute = route
  },
  render(entity, api) {
    return html`<div>Current route: ${entity.currentRoute}</div>`
  },
}

// Guard behavior
const requireAuth = (type) => ({
  navigate(entity, route, api) {
    if (!isAuthenticated()) {
      api.notify("navigate", "/login")
      return // Stop here, don't call the wrapped type
    }
    // Pass through to wrapped type
    type.navigate(entity, route, api)
  },
})

// Compose them
const types = {
  protectedPage: [page, requireAuth],
}
```

When you dispatch `navigate` on a `protectedPage`:

1. `requireAuth` checks authentication
2. If authenticated, it calls the original `page.navigate`
3. If not, it redirects to login

This is much cleaner than HOCs or wrapper components!

## Next Steps

- **[Rendering Model](./rendering-model.md)** — Deep dive into the full-tree rendering approach
- **[Event System](./event-system.md)** — Master events, targeting, and the event queue
- **[Type Composition](../advanced/type-composition.md)** — Learn advanced composition patterns
- **[Testing](../advanced/testing.md)** — How to test your entity types

Happy coding! 🚀
