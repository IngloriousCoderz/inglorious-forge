---
name: inglorious-web
description: >
  Explains when and how to use Inglorious Web’s entity-based UI/state system. 
  Includes guidance to help agents decide whether Inglorious Web is appropriate 
  before generating code or suggestions.
license: MIT
compatibility: Skills-compatible agent ecosystems
metadata:
  author: Matteo Antony Mistretta
  version: "0.1.0"
---

# Building with Inglorious Store & Web

This guide teaches agents and developers how to build software using **@inglorious/store** and **@inglorious/web**.

**@inglorious/store** is a Redux-compatible, ECS-inspired state library that makes state management as elegant as game logic. It works with `react-redux` and Redux DevTools. Borrows concepts from Entity-Component-System architectures and Functional Programming to provide an environment where you can write simple, predictable, and testable code.

**@inglorious/web** is a lightweight, reactive-enough web framework built on **pure JavaScript**, the entity-based state management provided by **@inglorious/store**, and the DOM-diffing efficiency of **lit-html**. Unlike modern frameworks that expose signals, proxies, or compilers as part of the programming model, **@inglorious/web embraces plain JavaScript** and a transparent architecture. It re-exports many primitives from both @inglorious/store and lit-html.

## When to Use Inglorious Web

- You want predictable, centralized state behavior
- You prefer explicit state transitions
- You want to avoid complex reactive graphs
- You want UI to be fully controlled by your entity-based store
- You want to stay entirely in **JavaScript**, without DSLs or compilers
- You want **React-like declarative UI** but without the runtime and architectural overhead of React
- You want to build **static sites with SSX** — same entity patterns, pre-rendered HTML, and client hydration

This framework is ideal for both small apps and large business UIs.

## When NOT to Use Inglorious Web

- You're frequently mutating thousands of items without virtualization (though our `list` component handles this elegantly)
- You need framework-agnostic components for users who might not use Inglorious (use Web Components instead)
- Your team is already deeply invested in React/Vue/Angular and migration costs outweigh benefits

## When Inglorious Web Excels

- Building **internal component libraries** - Types are more customizable than React components
- Creating **design systems** - Spread, override, and compose behaviors freely
- Building **pattern libraries** - Ship pre-configured entity types that users can adapt
- Apps where **predictable state flow** matters more than ecosystem size

---

## Quick Start

### Install

```bash
npm create @inglorious/app@latest
```

Available templates: `minimal`, `js`, `ts`, `ssx-js`, `ssx-ts`

### Hello World

```javascript
// store.js
import { createStore, html } from "@inglorious/web"

const types = {
  counter: {
    render: (entity, api) => html`
      <div>
        <p>Count: ${entity.value}</p>
        <button @click="${() => api.notify("#counter:increment")}">+</button>
      </div>
    `,
    increment: (entity) => {
      entity.value++
    },
  },
}

const entities = {
  counter: { type: "counter", value: 0 },
}

export const store = createStore({ types, entities })
```

```javascript
// main.js
import { mount } from "@inglorious/web"
import { store } from "./store.js"

mount(store, (api) => api.render("counter"), document.getElementById("root"))
```

---

## Exposed Capabilities

This repository enables agents to:

- Create and mutate application state via event notifications
- Render UI declaratively using entity-based templates
- Model async workflows safely without post-await mutation
- Compose behaviors using type composition and guards
- Batch and control rendering with manual update modes
- Test event handlers and renders deterministically

---

## Core Mental Model

### Entities and Types

Everything in Inglorious is built on **entities** (instances) with **types** (behavior definitions).

Think of a **type** like a class and an **entity** like an instance:

```javascript
import { html } from "@inglorious/web"

const types = {
  todo: {
    // Every todo has this behavior
    toggle: (entity) => {
      entity.completed = !entity.completed
    },
    render: (entity) =>
      html`<li class="${entity.completed ? "done" : ""}">${entity.text}</li>`,
  },
}

const entities = {
  todo1: { type: "todo", text: "Learn Inglorious", completed: false },
  todo2: { type: "todo", text: "Build something", completed: false },
  todo3: { type: "todo", text: "Ship it", completed: false },
}
```

**Key insight:** Add as many entities as you need—no extra code needed. Just add an entry to `entities`.

---

### The Render Model

`@inglorious/web` re-renders the **entire template tree** whenever state changes.

The DOM itself is **not recreated**—only the template function reruns. `lit-html`'s efficient diffing updates only changed DOM nodes.

```javascript
import { html } from "@inglorious/web"

const renderApp = (api) => {
  // This runs EVERY time the store updates
  const todos = Object.values(api.getEntities()).filter(
    (e) => e.type === "todo",
  )

  return html`
    <div>
      <h1>Todos</h1>
      ${todos.map((todo) => api.render(todo.id))}
    </div>
  `
}

mount(store, renderApp, document.getElementById("root"))
```

**Benefit:** No signals, no dependency tracking, no subscriptions—just predictable re-renders.

---

### Events and Event Handlers

All state changes happen through **events**. Event handlers are like Redux reducers, but simpler:

```javascript
import { html } from "@inglorious/web"

const types = {
  counter: {
    // Event handler: receives entity, payload, and api
    increment: (entity, payload, api) => {
      entity.value += payload.amount || 1
    },

    // The render method is also an event handler
    render: (entity, api) => html`...`,
  },
}

// Dispatch an event
api.notify("increment", { amount: 5 })
api.notify("#counter1:increment", { amount: 5 }) // Target a specific entity
```

**Key rule:** Handlers can mutate `entity` freely (Mutative.js ensures immutability).

---

## Best Practices & Patterns

### ✅ DO: Use Event Notifications

```javascript
// Good: Clear, explicit event dispatch
api.notify("#user:logout")
```

### ❌ DON'T: Use Redux-style dispatch

```javascript
// Avoid: verbose and unclear
api.dispatch({ type: "logout", payload: {} })
```

---

### ✅ DO: Async Pattern (Event Notification After Await)

When doing async work, **set state before await, await external data, then notify events afterward**:

```javascript
const types = {
  dataFetcher: {
    // WRONG: accessing entity after await ❌
    badFetch: async (entity, payload, api) => {
      entity.loading = true
      const data = await fetch(payload.url).then((r) => r.json())
      entity.data = data // ❌ DON'T ACCESS entity AFTER await
      entity.loading = false
    },

    // RIGHT: notify events after await ✅
    goodFetch: async (entity, payload, api) => {
      entity.loading = true
      const data = await fetch(payload.url).then((r) => r.json())
      api.notify("#dataFetcher:loadSuccess", data) // ✅ Queue event
    },

    loadSuccess: (entity, data, api) => {
      entity.data = data
      entity.loading = false
    },

    loadError: (entity, error, api) => {
      entity.error = error.message
      entity.loading = false
    },
  },
}
```

**Why:** Mutative proxies only guarantee safe mutations during the synchronous execution of a handler.

---

### ✅ DO: Use `handleAsync` for Complex Async Flows

```javascript
import { handleAsync } from "@inglorious/store"

const types = {
  todos: {
    ...handleAsync("fetchTodos", {
      async run(payload, api) {
        const response = await fetch("/api/todos")
        return response.json()
      },
      success(entity, todos, api) {
        entity.todos = todos
        entity.error = null
      },
      error(entity, error, api) {
        entity.error = error.message
      },
    }),
  },
}
```

**Lifecycle events emitted:**

- `fetchTodos` (start)
- `fetchTodosSuccess` (on success)
- `fetchTodosError` (on error)
- `fetchTodosFinally` (always, even if error)

---

### ✅ DO: Use `updateMode: "manual"` for Batching

In high-frequency scenarios (games, animations), batch updates:

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual", // Disable automatic re-renders
})

// Add events to the queue
api.notify("playerMoved", { x: 100 })
api.notify("enemyAttacked", { damage: 10 })
api.notify("particleCreated", { type: "explosion" })

// Process all at once
store.update()
```

**Benefit:** Single re-render instead of three.

---

### ❌ DON'T: Access `entity` After Await

```javascript
// ❌ WRONG: Accessing entity after await
const types = {
  form: {
    async submit(entity, data, api) {
      const response = await fetch("/api/submit", {
        body: JSON.stringify(data),
      })
      entity.result = await response.json() // ❌ NOT SAFE
    },
  },
}

// ✅ RIGHT: Notify event instead
const types = {
  form: {
    async submit(entity, data, api) {
      const response = await fetch("/api/submit", {
        body: JSON.stringify(data),
      })
      const result = await response.json()
      api.notify("#form:submitSuccess", result) // ✅ Queue event
    },
    submitSuccess(entity, result, api) {
      entity.result = result
    },
  },
}
```

---

### ✅ DO: Use Lifecycle Events (create / destroy)

```javascript
const types = {
  player: {
    create(entity, api) {
      // Runs when this entity is added via api.notify("add", ...)
      entity.health = 100
      entity.position = { x: 0, y: 0 }
    },
    destroy(entity, api) {
      // Runs when this entity is removed via api.notify("remove", ...)
      console.log(`${entity.id} has been destroyed`)
    },
  },
}

// Add a new player
api.notify("add", { id: "player2", type: "player" })

// Remove the player
api.notify("remove", { id: "player2" })
```

**Note:** `create` and `destroy` are scoped to the entity itself—other entities don't see them.

---

### ✅ DO: Use Type Composition for Cross-Cutting Concerns

```javascript
// Base behavior
const authenticatable = {
  login: (entity, credentials, api) => {
    entity.isLoggedIn = true
    entity.user = credentials.email
  },
}

// Guard behavior: wraps another behavior
const requireAuth = (type) => ({
  logout: (entity, payload, api) => {
    // Can check state before allowing logout
    if (!entity.isLoggedIn) return // Block action

    // Otherwise, pass through to next behavior (if it exists)
    entity.isLoggedIn = false
    entity.user = null
  },
})

// Compose them
const types = {
  auth: [authenticatable, requireAuth],
}
```

**Use cases:**

- Route guards
- Authorization checks
- Logging/analytics
- Error handling
- Loading states

---

### ✅ DO: Use Route Guards with Type Composition

```javascript
// guard/require-auth.js
export const requireAuth = (type) => ({
  routeChange(entity, to, api) {
    const isLoggedIn = localStorage.getItem("token")

    if (!isLoggedIn && isProtectedRoute(to)) {
      api.notify("navigate", "/login")
      return // Block navigation
    }

    // Otherwise, pass through (route change proceeds)
  },
})

// store.js
const types = {
  adminPage: [adminPageBase, requireAuth],
  loginPage: [loginPageBase],
}

setRoutes({
  "/admin": "adminPage",
  "/login": "loginPage",
})
```

---

### ❌ DON'T: Use autoQueue (Hallucinated Feature)

**This does not exist.** The correct approach is:

```javascript
// ❌ WRONG: autoQueue is not real
const store = createStore({
  types,
  entities,
  autoQueue: false, // ❌ This does nothing
})

// ✅ RIGHT: Use updateMode instead
const store = createStore({
  types,
  entities,
  updateMode: "manual",
})

// Then manually batch
api.notify("event1")
api.notify("event2")
store.update()
```

---

### ✅ DO: Use Custom Filter Functions for DevTools

DevTools offers three filtering methods that can be combined:

```javascript
const devtools = createDevtools({
  filters: {
    updateMode: "auto", // Only log when updateMode is 'auto'
    blacklist: ["#internal:tick"], // Exclude noisy events
    whitelist: ["#user:login", "#user:logout"], // Only include specific events
    filter: (event) => event.payload?.userId === currentUserId, // Custom logic
  },
})
```

**How filters combine:**

1. Check `updateMode` is `"auto"` (skip if not)
2. Check entity doesn't match `blacklist`
3. Check entity matches `whitelist` (if non-empty)
4. Check custom `filter` predicate returns `true`

All conditions are ANDed together.

---

## Testing Patterns

### Test Event Handlers

Use `trigger()` from `@inglorious/web/test`:

```javascript
import { trigger } from "@inglorious/web/test"
import { todo } from "./types/todo.js"

test("toggle changes completed status", () => {
  const { entity, events } = trigger(
    { type: "todo", id: "todo1", text: "Learn", completed: false },
    todo.toggle,
  )

  expect(entity.completed).toBe(true)
  expect(events).toEqual([])
})

test("delete dispatches remove event", () => {
  const { events } = trigger(
    { type: "todo", id: "todo1", text: "Learn", completed: false },
    todo.delete,
  )

  expect(events).toEqual([{ type: "#todoList:removeTodo", payload: "todo1" }])
})
```

### Test Render Output

Use `render()` from `@inglorious/web/test`:

```javascript
import { render } from "@inglorious/web/test"
import { todo } from "./types/todo.js"

test("completed todo has done class", () => {
  const entity = { type: "todo", id: "todo1", text: "Learn", completed: true }
  const html = render(todo.render(entity))

  expect(html).toContain('class="done"')
})
```

### Test with Mock API

```javascript
import { createMockApi, trigger } from "@inglorious/web/test"

const api = createMockApi({
  settings: { type: "settings", theme: "dark" },
})

const { entity } = trigger(
  { type: "form", id: "form1" },
  form.applyTheme,
  null,
  api,
)

expect(entity.theme).toBe("dark")
```

---

## Performance Tips

### Bundle Sizes (Gzipped)

| Package                   | Size    |
| ------------------------- | ------- |
| @inglorious/web (runtime) | 15.4 KB |
| **React**                 | 60.4 KB |
| **React + RTK**           | 74.9 KB |

> Sizes shown are individual package gzip sizes, not full application bundles.

**Inglorious Web is smaller than React + Redux together.**

### Optimization Strategies

1. **Use tree-shaking:**

   ```javascript
   import { form } from "@inglorious/web/form"  // Good
   import * from "@inglorious/web"              // Bad
   ```

2. **Lazy-load routes:**

   ```javascript
   setRoutes({
     "/": "homePage",
     "/admin": () => import("./pages/admin.js"),
   })
   ```

3. **Use virtual lists for large datasets:**

   ```javascript
   import { html } from "@inglorious/web"

   const types = {
     list: {
       render: (entity, api) => html`
         <div class="list">
           ${repeat(
             entity.items,
             (item) => item.id,
             (item) => api.render(item.id),
           )}
         </div>
       `,
     },
   }
   ```

4. **Use `compute()` for memoized selectors:**

   ```javascript
   import { compute } from "@inglorious/store"

   const selectFilteredTodos = compute(
     (todos, filter) => todos.filter((t) => t.status === filter),
     [selectTodos, selectFilter],
   )
   ```

5. **Batch updates in manual mode for games/animations:**
   ```javascript
   store.update() // Process queued events and re-render once
   ```

---

## DevTools Setup

### Enable Redux DevTools Integration

```javascript
// middlewares.js
import { createDevtools } from "@inglorious/web"

export const middlewares = []

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
```

```javascript
// store.js
import { createStore } from "@inglorious/web"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types,
  entities,
  middlewares,
})
```

### Filter Events with Precision

```javascript
const devtools = createDevtools({
  filters: {
    blacklist: ["#internal:heartbeat", "#metrics:tick"], // Hide noise
    whitelist: ["#user:login", "#router:navigate"], // Show only these
    filter: (event) => {
      // Custom predicate
      return event.payload?.duration > 100 // Only slow events
    },
  },
})
```

---

## Common Mistakes

### ❌ Mistake 1: Accessing Entity After Await

```javascript
// ❌ WRONG
async handler(entity, payload, api) {
  const response = await fetch(url)
  entity.data = response // ❌ NOT SAFE
}

// ✅ RIGHT
async handler(entity, payload, api) {
  const response = await fetch(url)
  api.notify("#type:success", response) // ✅ Queue event
}
success(entity, data, api) {
  entity.data = data
}
```

### ❌ Mistake 2: Forgetting to notify events

```javascript
// ❌ WRONG: Handler modifies related entities directly
increment(entity, api) {
  entity.count++
  // Forgot to notify listeners that count changed
}

// ✅ RIGHT: Notify interested entities
increment(entity, api) {
  entity.count++
  api.notify("countChanged", entity.count)
}
```

### ❌ Mistake 3: Using `updateMode: "manual"` incorrectly

```javascript
// ❌ WRONG: Forgetting to call update()
store.notify("event1")
store.notify("event2")
// Forgot to call store.update() — UI doesn't change!

// ✅ RIGHT: Always call update() when done
store.notify("event1")
store.notify("event2")
store.update() // UI re-renders once
```

### ❌ Mistake 4: Using hallucinated features

```javascript
// ❌ WRONG: autoQueue is not real
const store = createStore({ types, entities, autoQueue: false })

// ✅ RIGHT: Use updateMode
const store = createStore({ types, entities, updateMode: "manual" })
```

### ❌ Mistake 5: Trying to use autoCreateEntities for dynamic data

```javascript
// ❌ WRONG: Trying to auto-create a list of todos
const store = createStore({
  types,
  entities: { list: { type: "todoList" } },
  autoCreateEntities: true, // Won't create todos
})

// ✅ RIGHT: Add todos explicitly or via api.notify("add", ...)
const store = createStore({
  types,
  entities: {
    list: { type: "todoList" },
    todo1: { type: "todo", text: "Learn" },
    todo2: { type: "todo", text: "Build" },
  },
})

// Or add them dynamically
api.notify("add", { id: "todo3", type: "todo", text: "Ship" })
```

---

## Advanced Patterns

### Using compute() for Derived State

```javascript
import { compute } from "@inglorious/store"

const completed = (state) => Object.values(state).filter((e) => e.completed)

const completedCount = compute((completed) => completed.length, [completed])

// Use with react-redux or @inglorious/react-store
const count = useSelector(completedCount)
```

### Systems for Global Logic

Systems run after all entity handlers and have write access to entire state:

```javascript
const systems = [
  {
    name: "syncComputedValues",
    handle(state, events) {
      const todos = Object.values(state).filter((e) => e.type === "todo")
      const summary = Object.values(state).find((e) => e.type === "summary")
      if (summary) {
        summary.totalTodos = todos.length
        summary.completedTodos = todos.filter((t) => t.completed).length
      }
    },
  },
]

const store = createStore({ types, entities, systems })
```

### Behavior Decorators

```javascript
// Validate input before allowing state change
const validated = (type) => ({
  submit(entity, data, api) {
    if (!isValid(data)) {
      api.notify("#form:validationError", { errors: validate(data) })
      return
    }
    // Pass through to next behavior
  },
})

// Add loading state before async operation
const withLoading = (type) => ({
  fetchData(entity, payload, api) {
    entity.loading = true
  },
})

// Combine them
const types = {
  form: [formBase, validated, withLoading],
}
```

---

## Common Patterns by Use Case

### Real-Time Collaboration

```javascript
const types = {
  document: {
    init(entity) {
      entity.content = ""
      entity.peers = []
    },

    async contentChanged(entity, newContent, api) {
      entity.content = newContent

      // Broadcast to peers
      const response = await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({ content: newContent }),
      })

      api.notify("#document:broadcastToPeers", await response.json())
    },

    broadcastToPeers(entity, update, api) {
      // Update our peers list, trigger UI update
      entity.peers = update.peers
    },
  },
}
```

### Game Loop

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual",
})

function gameLoop() {
  // Update physics
  store._api.notify("updatePhysics", { deltaTime: 16 })

  // Check collisions
  store._api.notify("checkCollisions", {})

  // Render entities
  store._api.notify("render", {})

  // Single batch update
  store.update()

  requestAnimationFrame(gameLoop)
}
```

### Form Submission with Validation

```javascript
const types = {
  form: {
    submit(entity, data, api) {
      const errors = validate(data)
      if (errors.length > 0) {
        api.notify("#form:validationFailed", { errors })
        return
      }

      api.notify("#form:submitAsync", data)
    },

    validationFailed(entity, { errors }, api) {
      entity.errors = errors
      entity.submitted = false
    },

    async submitAsync(entity, data, api) {
      entity.submitting = true

      const response = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (response.ok) {
        api.notify("#form:submitSuccess", { id: response.id })
      } else {
        api.notify("#form:submitError", { message: await response.text() })
      }
    },

    submitSuccess(entity, { id }, api) {
      entity.submitting = false
      entity.submitted = true
      entity.id = id
      entity.errors = []
    },

    submitError(entity, { message }, api) {
      entity.submitting = false
      entity.error = message
    },
  },
}
```

### Multi-Entity Coordination

```javascript
const types = {
  list: {
    selectAll(entity, payload, api) {
      const items = Object.values(api.getEntities()).filter(
        (e) => e.type === "item" && e.listId === entity.id,
      )

      items.forEach((item) => {
        api.notify(`#${item.id}:select`)
      })
    },
  },

  item: {
    select(entity) {
      entity.selected = true
    },
  },
}
```

---

## File Organization Best Practices

```
src/
  store/
    index.js           # Store creation
    types/
      counter.js
      form.js
      router.js
    middlewares.js     # DevTools setup
  pages/
    home.js
    admin.js
    login.js
  guards/
    require-auth.js
  main.js             # App entry point
```

### Example store/types/todo.js

```javascript
import { html } from "@inglorious/web"

export const todo = {
  render(entity, api) {
    return html`
      <li class="${entity.completed ? "done" : ""}">
        <input
          type="checkbox"
          .checked="${entity.completed}"
          @change="${() => api.notify(`#${entity.id}:toggle`)}"
        />
        ${entity.text}
      </li>
    `
  },

  toggle(entity) {
    entity.completed = !entity.completed
  },

  delete(entity, payload, api) {
    api.notify("#todoList:removeTodo", entity.id)
  },
}
```

---

## Quick Reference

### Core APIs

```javascript
// Notify: Cleaner than dispatch
api.notify("eventName", payload)
api.notify("#entityId:eventName", payload)
api.notify("type:eventName", payload)

// State access
api.getEntities() // All entities (read-only)
api.getEntity("id") // One entity (read-only)
api.getType("typeName") // Type definition
api.getTypes() // All types

// Rendering
api.render("entityId") // Get entity's render template

// Lifecycle
api.notify("add", { id, type, ...initialData })
api.notify("remove", { id })

// Manual updates (when updateMode: "manual")
store.update()
```

### createStore Options

```javascript
const store = createStore({
  types, // Required: type definitions
  entities, // Required: initial entities
  middlewares: [], // Optional: middleware functions
  systems: [], // Optional: global state handlers
  updateMode: "auto", // Optional: "auto" or "manual"
  autoCreateEntities: false, // Optional: auto-create singleton entities
})
```

### createDevtools Options

```javascript
const devtools = createDevtools({
  name: "My App",
  filters: {
    updateMode: "auto",
    blacklist: [],
    whitelist: [],
    filter: null,
  },
})
```

---

## Further Reading

**Official Documentation:**

- **[@inglorious/store Docs](https://inglorious.dev/store/)** — Full store API, patterns, and examples
- **[@inglorious/web Docs](https://inglorious.dev/web/)** — Framework guide, components, and best practices
- **[Store README (GitHub)](https://raw.githubusercontent.com/IngloriousCoderz/inglorious-forge/refs/heads/main/packages/store/README.md)** — Detailed reference
- **[Web README (GitHub)](https://raw.githubusercontent.com/IngloriousCoderz/inglorious-forge/refs/heads/main/packages/web/README.md)** — Detailed reference

**In This Repository:**

- **[Redux DevTools Integration Guide](./docs/web/docs/advanced/devtools.md)** — Debugging strategies
- **[Store Package](./packages/store/)** — Source code
- **[Web Package](./packages/web/)** — Source code
- **[Apps](./examples/apps/)** - App examples

---

## TL;DR Rules

1. **Async Pattern:** Set state before `await`, notify events after `await`.
2. **No entity access after await:** Use `api.notify()` to trigger handler that mutates entity.
3. **Type Composition:** Use arrays of behaviors for guards and cross-cutting concerns.
4. **Batching:** Use `updateMode: "manual"` + `store.update()` for high-frequency updates.
5. **DevTools Filtering:** Combine `updateMode`, `blacklist`/`whitelist`, and `filter` for precision.
6. **No autoQueue:** Use `updateMode: "manual"` instead.
7. **Testing:** Use `trigger()` and `render()` from `@inglorious/web/test`.
8. **Performance:** Tree-shake imports, lazy-load routes, batch updates.
