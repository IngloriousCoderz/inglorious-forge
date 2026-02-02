# @inglorious/web

[![NPM version](https://img.shields.io/npm/v/@inglorious/web.svg)](https://www.npmjs.com/package/@inglorious/web)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, reactive-enough web framework built on **pure JavaScript**, the entity-based state management provided by **@inglorious/store**, and the DOM-diffing efficiency of **lit-html**.

Unlike modern frameworks that invent their own languages or rely on signals, proxies, or compilers, **@inglorious/web embraces plain JavaScript** and a transparent architecture.

---

## Features

- **Full-tree Re-rendering with DOM Diffing**  
  Your entire template tree re-renders on every state change, while **lit-html updates only the minimal DOM parts**.  
  No VDOM, no signals, no hidden dependencies.

- **Entity-Based Rendering Model**  
  Each entity type defines its own `render(entity, api)` method.  
  `api.render(id)` composes the UI by invoking the correct renderer for each entity.

- **Type Composition**  
  Types can be composed as arrays of behaviors, enabling reusable patterns like authentication guards, logging, or any cross-cutting concern.

- **Simple and Predictable API**  
  Zero magic, zero reactivity graphs, zero compiler.  
  Just JavaScript functions and store events.

- **Router, Forms, Tables, Virtual Lists**  
  High-level primitives built on the same predictable model.

- **Zero Component State**  
  All state lives in the store — never inside components.

- **No Signals, No Subscriptions, No Framework-Level Memory Leaks**  
  Because every render is triggered by the store, and lit-html handles the rest — no subscription cleanup needed.

- **No compilation required**  
  Apps can run directly in the browser — no build/compile step is strictly necessary (though you may use bundlers or Vite for convenience in larger projects).

---

## Create App (scaffolding)

To help bootstrap projects quickly, there's an official scaffolding tool: **[`@inglorious/create-app`](https://www.npmjs.com/package/@inglorious/create-app)**. It generates opinionated boilerplates so you can start coding right away.

Available templates:

- **minimal** — plain HTML, CSS, and JS (no build step)
- **js** — Vite-based JavaScript project
- **ts** — Vite + TypeScript project
- **ssx-js** — Static Site Xecution (SSX) project using JavaScript
- **ssx-ts** — Static Site Xecution (SSX) project using TypeScript

Use the scaffolder to create a starter app tailored to your workflow.

---

## Key Architectural Insight

### ✨ **Inglorious Web re-renders the whole template tree on each state change.**

**Important:** The DOM itself is not re-created. Only the template function reruns, and lit-html's efficient diffing updates just the changed DOM nodes.

Thanks to lit-html's optimized diffing, this is fast, predictable, and surprisingly efficient.

This means:

- **You do NOT need fine-grained reactivity**
- **You do NOT need selectors/signals/memos**
- **You do NOT track dependencies between UI fragments**
- **You cannot accidentally create memory leaks through subscriptions**

You get Svelte-like ergonomic simplicity, but with no compiler and no magic.

> "Re-render everything → let lit-html update only what changed."

It's that simple — and surprisingly fast in practice.

---

## When to Use Inglorious Web

- You want predictable behavior
- You prefer explicit state transitions
- You want to avoid complex reactive graphs
- You want UI to be fully controlled by your entity-based store
- You want to stay entirely in **JavaScript**, without DSLs or compilers
- You want **React-like declarative UI** but without the cost and overhead of React
- You want to build **static sites with SSX** — same entity patterns, pre-rendered HTML, and client hydration

This framework is ideal for both small apps and large business UIs.

---

## When NOT to Use Inglorious Web

- You're frequently mutating thousands of items without virtualization (though our `list` component handles this elegantly)
- You need framework-agnostic components for users who might not use Inglorious (use Web Components instead)
- Your team is already deeply invested in React/Vue/Angular and migration costs outweigh benefits

## When Inglorious Web EXCELS

- Building **internal component libraries** - Types are more customizable than React components
- Creating **design systems** - Spread, override, and compose behaviors freely
- Building **pattern libraries** - Ship pre-configured entity types that users can adapt
- Apps where **predictable state flow** matters more than ecosystem size

---

## Why Inglorious Web Avoids Signals

Other modern frameworks use:

- Proxies (Vue)
- Observables (MobX)
- Fine-grained signals (Solid, Angular v17+)
- Compiler-generated reactivity (Svelte)
- Fiber or granular subscriptions (React, Preact, Qwik, etc.)

These systems are powerful but introduce:

- hidden dependencies
- memory retention risks
- unpredictable update ordering
- steep learning curves
- framework-specific languages
- need for cleanup, teardown, and special lifecycle APIs
- challenges when mixing with game engines, workers, or non-UI code

### Inglorious Web takes a different stance:

✔ **Every entity update is explicit**  
✔ **Every UI update is a full diff pass**  
✔ **Every part of the system is just JavaScript**  
✔ **No special lifecycle**  
✔ **No subscriptions needed**  
✔ **No signals**  
✔ **No cleanup**  
✔ **No surprises**

This makes it especially suitable for:

- realtime applications
- hybrid UI/game engine contexts
- large enterprise apps where predictability matters
- developers who prefer simplicity over magic

---

## Comparison with Other Frameworks

### TL;DR Quick Comparison

| Framework      | Reactivity     | Build Transform  | Runtime Compiler | Component State | Bundle Size | Learning Curve |
| -------------- | -------------- | ---------------- | ---------------- | --------------- | ----------- | -------------- |
| Inglorious Web | Event-based    | None required    | No               | No (store only) | Tiny        | Very Low       |
| React          | VDOM diffing   | JSX + optional\* | No               | Yes             | Large       | Medium/High    |
| Vue            | Proxy-based    | SFC (optional)   | Available        | Yes             | Medium      | Medium         |
| Svelte         | Compiler magic | Required         | No               | Yes             | Small       | Medium         |
| SolidJS        | Fine signals   | JSX only         | No               | No (runs once)  | Tiny        | Medium/High    |
| Qwik           | Resumable      | Required         | No               | Yes             | Small       | Very High      |

\*React Compiler (stable 2024+) provides automatic memoization

<details>
<summary><strong>Click to expand detailed framework comparisons</strong></summary>

Here's how @inglorious/web compares to the major players in detail:

---

### **React**

| Feature                   | React                         | Inglorious Web                     |
| ------------------------- | ----------------------------- | ---------------------------------- |
| Rendering model           | VDOM diff + effects           | Full tree template + lit-html diff |
| Language                  | JSX (non-JS)                  | Pure JavaScript                    |
| Component state           | Yes                           | No — store only                    |
| Refs & lifecycles         | Many                          | None needed                        |
| Signals / fine reactivity | No (but heavy reconciliation) | No (rely on lit-html diff)         |
| Reconciliation overhead   | High (full VDOM diff)         | Low (template string diff)         |
| Bundle size               | Large                         | Tiny                               |
| Learning curve            | Medium/High                   | Very low                           |

React is powerful but complicated. Inglorious Web is simpler, lighter, and closer to native JS.

---

### **Vue (3)**

| Feature         | Vue                        | Inglorious Web                      |
| --------------- | -------------------------- | ----------------------------------- |
| Reactivity      | Proxy-based, deep tracking | Event-based updates + lit-html diff |
| Templates       | DSL                        | JavaScript templates                |
| Component state | Yes                        | No                                  |
| Lifecycle       | Many                       | None                                |
| Compiler        | Required for SFC           | None                                |

Vue reactivity is elegant but complex. Inglorious Web avoids proxies and keeps everything explicit.

---

### **Svelte**

| Feature        | Svelte                      | Inglorious Web     |
| -------------- | --------------------------- | ------------------ |
| Compiler       | Required                    | None               |
| Reactivity     | Compiler transforms $labels | Transparent JS     |
| Granularity    | Fine-grained                | Full-tree rerender |
| Learning curve | Medium                      | Low                |

Svelte is magic; Inglorious Web is explicit.

---

### **SolidJS**

| Feature    | Solid                | Inglorious Web     |
| ---------- | -------------------- | ------------------ |
| Reactivity | Fine-grained signals | No signals         |
| Components | Run once             | Rerun always       |
| Cleanup    | Required             | None               |
| Behavior   | Highly optimized     | Highly predictable |

Solid is extremely fast but requires a mental model shift.  
Inglorious Web trades peak performance for simplicity and zero overhead.

---

### **Qwik**

| Feature              | Qwik                 | Inglorious Web |
| -------------------- | -------------------- | -------------- |
| Execution model      | Resumable            | Plain JS       |
| Framework complexity | Very high            | Very low       |
| Reactivity           | Fine-grained signals | None           |

Qwik targets extreme performance at extreme complexity.  
Inglorious Web is minimal, predictable, and tiny.

---

### **HTMX / Alpine / Vanilla DOM**

Inglorious Web is closer philosophically to **HTMX** and **vanilla JS**, but with a declarative rendering model and entity-based state.

</details>

---

## Why Choose Inglorious Web

- Minimalistic
- Pure JavaScript
- Entity-based and predictable
- Extremely easy to reason about
- One render path, no hidden rules
- No reactivity graphs
- No per-component subscriptions
- No framework-level memory leaks
- No build step required (apps can run in the browser)
- Works perfectly in hybrid UI/game engine contexts
- Uses native ES modules and standards

If you want a framework that **does not fight JavaScript**, this is the one.

---

## Installation

```bash
npm install @inglorious/web
```

---

## Quick Start

### 1. Define Your Store and Entity Renders

First, set up your store with entity types. For each type you want to render, add a render method that returns a `lit-html` template.

```javascript
// store.js
import { createStore, html } from "@inglorious/web"

const types = {
  counter: {
    increment(entity) {
      entity.value++
    },

    // Define how a 'counter' entity should be rendered
    render(entity, api) {
      return html`
        <div>
          <span>Count: ${entity.value}</span>
          <button @click=${() => api.notify(`#${entity.id}:increment`)}>
            +1
          </button>
        </div>
      `
    },
  },
}

const entities = {
  counter1: { type: "counter", value: 0 },
  counter2: { type: "counter", value: 10 },
}

export const store = createStore({ types, entities })
```

### 2. Create Your Root Template and Mount

Write a root rendering function that uses the provided api to compose the UI, then use `mount` to attach it to the DOM.

```javascript
// main.js
import { mount, html } from "@inglorious/web"
import { store } from "./store.js"

// This function receives the API and returns a lit-html template
const renderApp = (api) => {
  const entities = Object.values(api.getEntities())

  return html`
    <h1>Counters</h1>
    ${entities.map((entity) => api.render(entity.id))}
  `
}

// Mount the app to the DOM
mount(store, renderApp, document.getElementById("root"))
```

The `mount` function subscribes to the store and automatically re-renders your template whenever the state changes.

---

## Testing

One of Inglorious Web's greatest strengths is **testability**. Entity handlers are pure functions (via Mutative.js), and render functions return simple templates. No special testing libraries, no complex setup, no mocking hell.

### Testing Utilities

Inglorious Web provides two simple utilities for testing via `@inglorious/web/test`:

#### `trigger(entity, handler, payload?, api?)`

Execute an entity handler and get back the new state plus any events dispatched. Handlers are wrapped in Mutative.js, so they return new immutable state even though you write mutable-looking code.

```javascript
import { trigger } from "@inglorious/web/test"
import { counter } from "./types/counter.js"

test("increment adds to value", () => {
  const { entity, events } = trigger(
    { type: "counter", id: "counter1", value: 10 },
    counter.increment,
    { amount: 5 },
  )

  expect(entity.value).toBe(15)
  expect(events).toEqual([]) // No events dispatched
})

test("increment dispatches overflow event", () => {
  const { entity, events } = trigger(
    { type: "counter", id: "counter1", value: 99 },
    counter.increment,
    { amount: 5 },
  )

  expect(entity.value).toBe(104)
  expect(events).toEqual([{ type: "overflow", payload: { id: "counter1" } }])
})
```

#### `render(template)`

Render a lit-html template to an HTML string for testing. Perfect for testing render output with simple string assertions.

```javascript
import { render } from "@inglorious/web/test"
import { counter } from "./types/counter.js"

test("counter renders correctly", () => {
  const entity = {
    type: "counter",
    id: "counter1",
    value: 42,
  }

  const mockApi = {
    notify: jest.fn(),
  }

  const template = counter.render(entity, mockApi)
  const html = render(template)

  expect(html).toContain("Count: 42")
  expect(html).toContain("button")
})

test("counter button has click handler", () => {
  const entity = { type: "counter", id: "counter1", value: 10 }
  const mockApi = { notify: jest.fn() }

  const template = counter.render(entity, mockApi)
  const html = render(template)

  expect(html).toContain("onclick")
})
```

### Why Testing is Easy

**No special setup required:**

```bash
npm install --save-dev vitest  # or jest, or node:test
```

That's it. No `@testing-library/react`, no `renderHook`, no `act()` wrappers.

**Pure functions everywhere:**

- Entity handlers are pure (thanks to Mutative.js)
- Render functions are pure (they return templates)
- No lifecycle hooks to manage
- No async state updates to wrangle

**Simple assertions:**

- Test handlers: `expect(entity.value).toBe(15)`
- Test renders: `expect(html).toContain('expected text')`
- Test events: `expect(events).toHaveLength(1)`

### Testing Patterns

#### Unit Test: Handler Logic

```javascript
import { trigger } from "@inglorious/web/test"
import { todo } from "./types/todo.js"

test("toggle changes completed status", () => {
  const { entity } = trigger(
    { type: "todo", id: "todo1", text: "Buy milk", completed: false },
    todo.toggle,
  )

  expect(entity.completed).toBe(true)
})

test("delete dispatches remove event", () => {
  const { events } = trigger(
    { type: "todo", id: "todo1", text: "Buy milk" },
    todo.delete,
  )

  expect(events).toEqual([{ type: "#todoList:removeTodo", payload: "todo1" }])
})
```

#### Unit Test: Render Output

```javascript
import { render } from "@inglorious/web/test"
import { todo } from "./types/todo.js"

test("todo renders text and status", () => {
  const entity = {
    type: "todo",
    id: "todo1",
    text: "Buy milk",
    completed: false,
  }

  const html = render(todo.render(entity, { notify: jest.fn() }))

  expect(html).toContain("Buy milk")
  expect(html).not.toContain("completed")
})

test("completed todo has completed class", () => {
  const entity = {
    type: "todo",
    id: "todo1",
    text: "Buy milk",
    completed: true,
  }

  const html = render(todo.render(entity, { notify: jest.fn() }))

  expect(html).toContain("completed")
})
```

#### Integration Test: Full Store

```javascript
import { createStore } from "@inglorious/web"
import { counter } from "./types/counter.js"

test("full user interaction flow", () => {
  const store = createStore({
    types: { counter },
    entities: {
      counter1: { type: "counter", id: "counter1", value: 0 },
    },
  })

  // User clicks increment
  store.notify("#counter1:increment", { amount: 5 })
  expect(store.entities.counter1.value).toBe(5)

  // User clicks increment again
  store.notify("#counter1:increment", { amount: 3 })
  expect(store.entities.counter1.value).toBe(8)
})
```

#### Testing Computed State

```javascript
import { compute } from "@inglorious/store"

test("filtered todos excludes completed", () => {
  const todos = [
    { id: 1, text: "Buy milk", completed: false },
    { id: 2, text: "Walk dog", completed: true },
    { id: 3, text: "Write tests", completed: false },
  ]

  const getActiveTodos = compute(
    (todos) => todos.filter((t) => !t.completed),
    [() => todos],
  )

  const result = getActiveTodos()

  expect(result).toHaveLength(2)
  expect(result[0].text).toBe("Buy milk")
  expect(result[1].text).toBe("Write tests")
})
```

### Comparison with React Testing

**React (with hooks):**

```javascript
import { renderHook, act } from "@testing-library/react"

test("counter increments", () => {
  const { result } = renderHook(() => useCounter())

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
```

**Inglorious Web:**

```javascript
import { trigger } from "@inglorious/web/test"

test("counter increments", () => {
  const { entity } = trigger({ value: 0 }, counter.increment)

  expect(entity.value).toBe(1)
})
```

**The difference:**

- ❌ React requires `renderHook`, `act()`, special testing library
- ✅ Inglorious just calls the function directly
- ❌ React hooks can't be tested in isolation
- ✅ Inglorious handlers are just functions
- ❌ React has async timing issues
- ✅ Inglorious is synchronous and predictable

### Testing Type Composition

Type composition (like route guards) is also easy to test:

```javascript
import { trigger } from "@inglorious/web/test"
import { requireAuth } from "./guards/require-auth.js"
import { adminPage } from "./pages/admin.js"

test("requireAuth blocks unauthenticated access", () => {
  // Compose the guard with the page type
  const guardedPage = requireAuth(adminPage)

  // Mock localStorage.getItem to return null (not logged in)
  const mockApi = {
    notify: jest.fn(),
  }

  const { events } = trigger(
    { type: "adminPage", id: "admin" },
    guardedPage.routeChange,
    { route: "adminPage" },
    mockApi,
  )

  // Should redirect to login
  expect(events).toContainEqual(
    expect.objectContaining({
      type: "navigate",
      payload: expect.objectContaining({ to: "/login" }),
    }),
  )
})

test("requireAuth allows authenticated access", () => {
  // Mock localStorage.getItem to return user data
  localStorage.setItem("user", JSON.stringify({ id: 1 }))

  const guardedPage = requireAuth(adminPage)
  const mockApi = { notify: jest.fn() }

  const { events } = trigger(
    { type: "adminPage", id: "admin" },
    guardedPage.routeChange,
    { route: "adminPage" },
    mockApi,
  )

  // Should NOT redirect
  expect(events).toEqual([])

  // Cleanup
  localStorage.removeItem("user")
})
```

### Fast Test Execution

Because Inglorious tests don't mount components or manipulate the DOM, they're extremely fast:

```bash
# Typical test suite times
React: 30-60 seconds for 100 tests
Inglorious: 1-3 seconds for 100 tests
```

This makes TDD (Test-Driven Development) actually enjoyable. Fast feedback loops mean you'll actually run tests while coding.

### Best Practices

1. **Test handlers separately from renders** - Unit test logic, integration test UI
2. **Use descriptive test names** - "increment adds to value" not "test increment"
3. **Test edge cases** - Empty states, max values, null checks
4. **Keep tests simple** - One assertion per test when possible
5. **Don't over-mock** - Only mock what you must (usually just `api.notify`)

### When to Write Tests

- ✅ **Always test:** Complex business logic, calculations, validations
- ✅ **Often test:** Event handlers, state transitions, conditional renders
- ⚠️ **Sometimes test:** Simple getters, trivial renders
- ❌ **Rarely test:** Third-party components, framework internals

### The Bottom Line

If your framework makes testing painful, developers won't test. If testing is trivial, they will.

**Inglorious Web makes testing so easy that you'll actually write tests.**

No special libraries, no complex setup, just pure functions and simple assertions. Testing becomes a natural part of your workflow, not a chore you avoid.

---

## JSX Support

If you prefer JSX syntax over template literals, you can use **[`@inglorious/vite-plugin-jsx`](https://www.npmjs.com/package/@inglorious/vite-plugin-jsx)**.

This Vite plugin transforms standard JSX/TSX into optimized `lit-html` templates at compile time. You get the familiar developer experience of JSX without React's runtime, hooks, or VDOM overhead.

To use it:

1. Install the plugin: `npm install -D @inglorious/vite-plugin-jsx`
2. Add it to your `vite.config.js`
3. Write your render functions using JSX

```jsx
export const counter = {
  render(entity, api) {
    return (
      <div className="counter">
        <span>Count: {entity.value}</span>
        <button onClick={() => api.notify(`#${entity.id}:increment`)}>
          +1
        </button>
      </div>
    )
  },
}
```

See the plugin documentation for full details on control flow, attributes, and engine components.

---

## Vue Template Support

If you prefer **Vue Single-File Component–style templates**, you can use
**`@inglorious/vite-plugin-vue`** to write Vue-like `<template>` syntax and compile it into optimized `lit-html` render functions for **@inglorious/web**.

This plugin is **not Vue** and does **not implement Vue’s reactivity model**.
Instead, it provides a **template-only compatibility layer** that maps a well-defined subset of Vue template syntax onto Inglorious Web’s entity-based rendering model.

### What This Is (and Is Not)

✔ **Is:**

- A Vue-like _template syntax_ compiler
- Zero-runtime, compile-time transformation
- Direct output to `lit-html`
- Fully compatible with Inglorious entities and store-driven rendering

❌ **Is NOT:**

- Vue runtime
- Vue reactivity (no proxies, refs, watchers)
- Vue SFC compiler
- A drop-in replacement for Vue apps

Think of it as **“Vue templates as a syntax convenience”**, not Vue itself.

---

### Supported Syntax

The plugin supports the most common and useful Vue template features:

#### Templates

```vue
<template>
  <div class="counter">
    <span>{{ value }}</span>
    <button @click="increment">+</button>
  </div>
</template>
```

#### Interpolations

- `{{ value }}`
- Automatically prefixed with `entity.` when appropriate

#### Conditionals

- `v-if`
- `v-else-if`
- `v-else`

Compiled using `lit-html`’s `when()` directive.

#### Loops

- `v-for="item in items"`
- `v-for="(item, index) in items"`
- Optional `:key`

Compiled using `lit-html`’s `repeat()` directive.

#### Bindings

- `:prop="expr"`
- `v-bind:prop="expr"`
- Static attributes
- Correct handling of property vs attribute bindings

#### Events

- `@click="method"`
- `@click="() => method(entity, arg)"`
- `v-on:event="handler"`

Method references are automatically translated to `api.notify(...)` calls.

#### Components

- PascalCase components are treated as entity renders:

```vue
<Message />
```

```js
api.render("message")
```

---

### Script Sections

Both JavaScript and TypeScript are supported:

```vue
<script lang="ts">
const message: string = "Hello"

const greet = (entity: any): void => {
  console.log(entity.message)
}
</script>
```

The plugin automatically:

- Separates **state variables** from **methods**
- Strips TypeScript annotations
- Emits clean JavaScript output
- Generates entity-compatible methods

---

### Example

**Vue-style input:**

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <TodoItem v-for="todo in todos" :key="todo.id" />
  </div>
</template>

<script>
const title = "Todos"
</script>
```

**Generated output (simplified):**

```js
export const app = {
  create(entity) {
    entity.title = "Todos"
  },

  render(entity, api) {
    return html`
      <div>
        <h1>${entity.title}</h1>
        ${repeat(entity.todos, (todo) => api.render("todoItem"))}
      </div>
    `
  },
}
```

---

### Design Philosophy

This plugin exists to support developers who:

- Like Vue’s **template ergonomics**
- Want to migrate incrementally from Vue
- Prefer HTML-like syntax over JS mixed with tags
- Still want **Inglorious Web’s explicit, predictable architecture**

It deliberately avoids:

- Hidden reactivity
- Magic bindings
- Lifecycle hooks
- Framework-level state

Everything still flows through **entities, events, and full-tree renders**.

---

### When to Use Native lit-html vs Vue Templates vs JSX

| Choose this if you…           | Use             |
| ----------------------------- | --------------- |
| Like HTML templates           | lit-html or Vue |
| Want JSX ergonomics           | JSX             |
| Prefer JavaScript-only syntax | lit-html        |
| Prefer declarative templates  | lit-html or Vue |
| Are migrating from Vue        | Vue templates   |
| Want maximal explicitness     | lit-html or JSX |

Both plugins generate **the same runtime model**.

---

## Redux DevTools Integration

`@inglorious/web` ships with first-class support for the **Redux DevTools Extension**, allowing you to:

- inspect all store events
- time-travel through state changes
- restore previous states
- debug your entity-based logic visually

To enable DevTools, add the middleware provided by `createDevtools()`.

### 1. Create a `middlewares.js` file

```javascript
// middlewares.js
import { createDevtools } from "@inglorious/web"

export const middlewares = []

// Enable DevTools only in development mode
if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
```

### 2. Pass middlewares when creating the store

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

Now your application state is fully visible in the Redux DevTools browser extension.

### What You'll See in DevTools

- Each event you dispatch via `api.notify(event, payload)` will appear as an action in the DevTools timeline.
- The entire store is visible under the _State_ tab.
- You can time-travel or replay events exactly like in Redux.

No additional configuration is needed.

---

## Client-Side Router

`@inglorious/web` includes a lightweight, entity-based client-side router. It integrates directly into your `@inglorious/store` state, allowing your components to reactively update based on the current URL.

### 1. Setup the Router

To enable the router, add it to your store's types and create a `router` entity. Register route patterns using the router module helpers (`setRoutes`, `addRoute`) — routes are configured at module level and not stored on the router entity itself.

```javascript
// store.js
import { createStore, html } from "@inglorious/web"
import { router, setRoutes } from "@inglorious/web/router"

const types = {
  // 1. Add the router type to your store's types
  router,

  // 2. Define types for your pages
  homePage: {
    render: () => html`<h1>Welcome Home!</h1>`,
  },
  userPage: {
    render: (entity, api) => {
      // Access route params from the router entity
      const { params } = api.getEntity("router")
      return html`<h1>User ${params?.id ?? "Unknown"} - ${entity.username}</h1>`
    },
  },
  notFoundPage: {
    render: () => html`<h1>404 - Page Not Found</h1>`,
  },
}

const entities = {
  // 3. Create the router entity (no `routes` here)
  router: {
    type: "router",
  },
  userPage: {
    type: "userPage",
    username: "Alice",
  },
}

export const store = createStore({ types, entities })

// Register routes at module level
setRoutes({
  "/": "homePage",
  "/users/:id": "userPage",
  "*": "notFoundPage",
})
```

### 2. Render the Current Route

In your root template, read the `route` property from the router entity and use `api.render()` to display the correct page.

```javascript
// main.js
import { mount, html } from "@inglorious/web"
import { store } from "./store.js"

const renderApp = (api) => {
  const { route } = api.getEntity("router") // e.g., "homePage" or "userPage"

  return html`
    <nav><a href="/">Home</a> | <a href="/users/123">User 123</a></nav>
    <main>${route ? api.render(route) : ""}</main>
  `
}

mount(store, renderApp, document.getElementById("root"))
```

The router automatically intercepts clicks on local `<a>` tags and handles browser back/forward events, keeping your UI in sync with the URL.

### 3. Programmatic Navigation

To navigate from your JavaScript code, dispatch a `navigate` event.

```javascript
api.notify("navigate", "/users/456")

// Or navigate back in history
api.notify("navigate", -1)

// With options
api.notify("navigate", {
  to: "/users/456",
  replace: true, // Replace current history entry
  force: true, // Force navigation even if path is identical (useful after logout)
})
```

### 4. Lazy Loading Routes

You can improve performance by lazy-loading routes. Use a loader function that returns a dynamic import when registering the route via `setRoutes`.

**Note:** The imported module must use a named export for the entity type (not `export default`), so the router can register it with a unique name in the store.

```javascript
// store.js
const entities = {
  router: { type: "router" },
}

export const store = createStore({ types, entities })

setRoutes({
  "/": "homePage",
  // Lazy load: returns a Promise resolving to a module
  "/admin": () => import("./pages/admin.js"),
})
```

```javascript
// pages/admin.js
import { html } from "@inglorious/web"

// Must be a named export matching the type name you want to use
export const adminPage = {
  render: () => html`<h1>Admin Area</h1>`,
}
```

### 5. Route Guards (Type Composition)

Route guards are implemented using **type composition** — a powerful feature of `@inglorious/store` where types can be defined as arrays of behaviors that wrap and extend each other.

Guards are simply behaviors that intercept events (like `routeChange`) and can prevent navigation, redirect, or pass through to the protected page.

#### Example: Authentication Guard

```javascript
// guards/require-auth.js
export const requireAuth = (type) => ({
  routeChange(entity, payload, api) {
    // Only act when navigating to this specific route
    if (payload.route !== entity.type) return

    // Check authentication
    const user = localStorage.getItem("user")
    if (!user) {
      // Redirect to login, preserving the intended destination
      api.notify("navigate", {
        to: "/login",
        redirectTo: window.location.pathname,
        replace: true,
      })
      return
    }

    // User is authenticated - pass through to the actual page handler
    type.routeChange?.(entity, payload, api)
  },
})
```

#### Using Guards with Type Composition

```javascript
// store.js
import { createStore } from "@inglorious/web"
import { router } from "@inglorious/web/router"
import { requireAuth } from "./guards/require-auth.js"
import { adminPage } from "./pages/admin.js"
import { loginPage } from "./pages/login.js"

const types = {
  router,

  // Public page - no guard
  loginPage,

  // Protected page - composed with requireAuth guard
  adminPage: [adminPage, requireAuth],
}

const entities = {
  router: { type: "router" },
  adminPage: { type: "adminPage" },
  loginPage: { type: "loginPage" },
}

export const store = createStore({ types, entities })

// Register routes via the router module API
setRoutes({
  "/login": "loginPage",
  "/admin": "adminPage",
})
```

#### How Type Composition Works

When you define a type as an array like `[adminPage, requireAuth]`:

1. The behaviors compose in order (left to right)
2. Each behavior can intercept events before they reach the next behavior
3. Guards can choose to:
   - **Block** by returning early (not calling the next handler)
   - **Redirect** by triggering navigation to a different route
   - **Pass through** by calling the next behavior's handler

This pattern is extremely flexible and can be used for:

- **Authentication** - Check if user is logged in
- **Authorization** - Check user roles or permissions
- **Analytics** - Log page views
- **Redirects** - Redirect logged-in users away from login page
- **Loading states** - Show loading UI while checking async permissions
- **Any cross-cutting concern** you can think of

#### Multiple Guards

You can compose multiple guards for fine-grained control:

```javascript
const types = {
  // Require authentication AND admin role
  adminPage: [adminPage, requireAuth, requireAdmin],

  // Require authentication AND resource ownership
  userProfile: [userProfile, requireAuth, requireOwnership],
}
```

Guards execute in order, so earlier guards can block navigation before later guards even run.

---

## Type Composition

One of the most powerful features of `@inglorious/store` (and therefore `@inglorious/web`) is **type composition**. Types can be defined as arrays of behaviors that wrap each other, enabling elegant solutions to cross-cutting concerns.

### Basic Composition

```javascript
const logging = (type) => ({
  // Intercept the render method
  render(entity, api) {
    console.log(`Rendering ${entity.id}`)
    return type.render(entity, api)
  },

  // Intercept any event
  someEvent(entity, payload, api) {
    console.log(`Event triggered on ${entity.id}`)
    type.someEvent?.(entity, payload, api)
  },
})

const types = {
  // Compose the counter type with logging
  counter: [counterBase, logging],
}
```

### Use Cases

Type composition enables elegant solutions for:

- **Route guards** - Authentication, authorization, redirects
- **Logging/debugging** - Trace renders and events
- **Analytics** - Track user interactions
- **Error boundaries** - Catch and handle render errors gracefully
- **Loading states** - Show spinners during async operations
- **Caching/memoization** - Cache expensive computations
- **Validation** - Validate entity state before operations
- **Any cross-cutting concern**

The composition pattern keeps your code modular and reusable without introducing framework magic.

---

## Table

`@inglorious/web` includes a `table` type for displaying data in a tabular format. It's designed to be flexible and customizable.

### 1. Add the `table` type

To use it, import the `table` type and its CSS, then create an entity for your table. You must define the `data` to be displayed and can optionally provide `columns` definitions.

```javascript
// In your entity definition file
import { table } from "@inglorious/web/table"

// Import base styles and a theme. You can create your own theme.
import "@inglorious/web/table/base.css"
import "@inglorious/web/table/theme.css"

export default {
  ...table,
  data: [
    { id: 1, name: "Product A", price: 100 },
    { id: 2, name: "Product B", price: 150 },
  ],
  columns: [
    { id: "id", label: "ID" },
    { id: "name", label: "Product Name" },
    { id: "price", label: "Price" },
  ],
}
```

### 2. Custom Rendering

You can customize how data is rendered in the table cells by overriding the `renderValue` method. This is useful for formatting values or displaying custom content.

The example below from `examples/apps/web-table/src/product-table/product-table.js` shows how to format values based on a `formatter` property in the column definition.

```javascript
import { table } from "@inglorious/web/table"
import { format } from "date-fns"

const formatters = {
  isAvailable: (val) => (val ? "✔️" : "❌"),
  createdAt: (val) => format(val, "dd/MM/yyyy HH:mm"),
}

export const productTable = {
  ...table,

  renderValue(value, column) {
    return formatters[column.formatter]?.(value) ?? value
  },
}
```

### 3. Theming

The table comes with a base stylesheet (`@inglorious/web/table/base.css`) and a default theme (`@inglorious/web/table/theme.css`). You can create your own theme by creating a new CSS file and styling the table elements to match your application's design.

---

## Select

`@inglorious/web` includes a robust `select` type for handling dropdowns, supporting single/multi-select, filtering, and keyboard navigation.

### 1. Add the `select` type

Import the `select` type and its CSS, then create an entity.

```javascript
import { createStore } from "@inglorious/web"
import { select } from "@inglorious/web/select"
// Import base styles and theme
import "@inglorious/web/select/base.css"
import "@inglorious/web/select/theme.css"

const types = { select }

const entities = {
  countrySelect: {
    type: "select",
    options: [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
      { value: "fr", label: "France" },
    ],
    // Configuration
    isMulti: false,
    isSearchable: true,
    placeholder: "Select a country...",
  },
}

const store = createStore({ types, entities })
```

### 2. Render

Render it like any other entity.

```javascript
const renderApp = (api) => {
  return html` <div class="my-form">${api.render("countrySelect")}</div> `
}
```

### 3. State & Events

The `select` entity maintains its own state:

- `selectedValue`: The current value (single value or array if `isMulti: true`).
- `isOpen`: Whether the dropdown is open.
- `searchTerm`: Current search input.

It listens to internal events like `#<id>:toggle`, `#<id>:optionSelect`, etc. You typically don't need to manually dispatch these unless you are building custom controls around it.

---

## Forms

`@inglorious/web` includes a small but powerful `form` type for managing form state inside your entity store. It offers:

- Declarative form state held on an entity (`initialValues`, `values`, `errors`, `touched`)
- Convenient helpers for reading field value/error/touched state (`getFieldValue`, `getFieldError`, `isFieldTouched`)
- Built-in handlers for field changes, blurs, array fields, sync/async validation and submission

### Add the `form` type

Include `form` in your `types` and create an entity for the form (use any id you like — `form` is used below for clarity):

```javascript
import { createStore } from "@inglorious/web"
import { form } from "@inglorious/web/form"

const types = { form }

const entities = {
  form: {
    type: "form",
    initialValues: {
      name: "",
      email: "",
      addresses: [],
    },
  },
}

const store = createStore({ types, entities })
```

### How it works (events & helpers)

The `form` type listens for a simple set of events (target the specific entity id with `#<id>:<event>`):

- `#<id>:fieldChange` — payload { path, value, validate? } — set a field value and optionally run a single-field validator
- `#<id>:fieldBlur` — payload { path, validate? } — mark field touched and optionally validate on blur
- `#<id>:fieldArrayAppend|fieldArrayRemove|fieldArrayInsert|fieldArrayMove` — manipulate array fields
- `#<id>:reset` — reset the form to `initialValues`
- `#<id>:validate` — synchronous whole-form validation; payload { validate }
- `#<id>:validateAsync` — async whole-form validation; payload { validate }
- `#<id>:submit` — typically handled by your `form` type's `submit` method (implement custom behavior there)

Helpers available from the package let you read state from templates and field helper components:

- `getFieldValue(formEntity, path)` — read a nested field value
- `getFieldError(formEntity, path)` — read a nested field's error message
- `isFieldTouched(formEntity, path)` — check if a field has been touched

Form state includes helpful flags:

- `isPristine` — whether the form has changed from initial values
- `isValid` — whether the current form has no validation errors
- `isValidating` — whether async validation is in progress
- `isSubmitting` — whether submission is in progress
- `submitError` — an optional submission-level error message

### Simple example (from examples/apps/web-form)

Field components typically call `api.notify` and the `form` entity reacts accordingly. Example input field usage:

```javascript
// inside a field component render
@input=${(e) => api.notify(`#${entity.id}:fieldChange`, { path: 'name', value: e.target.value, validate: validateName })}
@blur=${() => api.notify(`#${entity.id}:fieldBlur`, { path: 'name', validate: validateName })}
```

Submissions and whole-form validation can be triggered from a `form` render:

```javascript
<form @submit=${() => { api.notify(`#form:validate`, { validate: validateForm }); api.notify(`#form:submit`) }}>
  <!-- inputs / buttons -->
</form>
```

For a complete, working demo and helper components look at `examples/apps/web-form` which ships with the repository.

---

## Virtualized lists

`@inglorious/web` provides a small virtualized `list` type to efficiently render very long lists by only keeping visible items in the DOM. The `list` type is useful when you need to display large datasets without paying the full cost of mounting every element at once.

Key features:

- Renders only the visible slice of items and positions them absolutely inside a scrolling container.
- Automatically measures the first visible item height when not provided.
- Efficient scroll handling with simple buffer controls to avoid visual gaps.

### Typical entity shape

When you add the `list` type to your store the entity can include these properties (the type will provide sensible defaults). Only `items` is required — all other properties are optional:

- `items` (Array) — the dataset to render.
- `visibleRange` ({ start, end }) — current visible slice indices.
- `viewportHeight` (number) — height of the scrolling viewport in pixels.
- `itemHeight` (number | null) — fixed height for each item (when null, the type will measure the first item and use an estimated height).
- `estimatedHeight` (number) — fallback height used before measurement.
- `bufferSize` (number) — extra items to render before/after the visible range to reduce flicker during scrolling.

### Events & methods

The `list` type listens for the following events on the target entity:

- `#<id>:scroll` — payload is the scrolling container; updates `visibleRange` based on scroll position.
- `#<id>:measureHeight` — payload is the container element; used internally to measure the first item and compute `itemHeight`.

It also expects the item type to export `renderItem(item, index, api)` so each visible item can be rendered using the project's entity-based render approach.

### Example

Minimal example showing how to extend the `list` type to create a domain-specific list (e.g. `productList`) and provide a `renderItem(item, index, api)` helper.

```javascript
import { createStore, html } from "@inglorious/web"
import { list } from "@inglorious/web/list"

// Extend the built-in list type to render product items
const productList = {
  ...list,

  renderItem(item, index) {
    return html`<div class="product">
      ${index}: <strong>${item.name}</strong> — ${item.price}
    </div>`
  },
}

const types = { list: productList }

const entities = {
  products: {
    type: "list",
    items: Array.from({ length: 10000 }, (_, i) => ({
      name: `Product ${i}`,
      price: `$${i}`,
    })),
    viewportHeight: 400,
    estimatedHeight: 40,
    bufferSize: 5,
  },
}

const store = createStore({ types, entities })

// Render with api.render(entity.id) as usual — the list will call productList.renderItem for each visible item.
```

See `src/list.js` in the package for the implementation details and the `examples/apps/web-list` demo for a complete working example. In the demo the `productList` type extends the `list` type and provides `renderItem(item, index)` to render each visible item — see `examples/apps/web-list/src/product-list/product-list.js`.

---

## Building Component Libraries with Inglorious Web

**Inglorious types are uniquely suited for component libraries** because they're fully customizable through JavaScript's spread operator.

### The Pattern

**Library publishes types:**

```javascript
// @acme/design-system/table.js
export const table = {
  render(entity, api) {
    const type = api.getType(entity.type)

    return html`
      <table>
        ${entity.data.map((row) => type.renderRow(entity, row, api))}
      </table>
    `
  },

  renderRow(entity, row, api) {
    return html`<tr>
      ${row.name}
    </tr>`
  },

  rowClick(entity, row) {
    entity.selectedRow = row
  },
}
```

**Users customize freely:**

```javascript
import { table } from "@acme/design-system/table"

// Use as-is
const simpleTable = { ...table }

// Override methods
const customTable = {
  ...table,
  renderRow(entity, row, api) {
    return html`<tr class="custom">
      ${row.name} - ${row.email}
    </tr>`
  },
}

// Compose with behaviors
import { sortable, exportable } from "@acme/design-system/behaviors"

const advancedTable = [
  table,
  sortable,
  exportable,
  {
    rowClick(entity, row) {
      console.log("Custom click handler", row)
    },
  },
]
```

### Why This Is Better Than React Components

| Feature                    | React Components               | Inglorious Types                          |
| -------------------------- | ------------------------------ | ----------------------------------------- |
| Customize rendering        | Only if `render` prop exposed  | Override `render()` method directly       |
| Customize behavior         | Only if callback props exposed | Override any method                       |
| Compose multiple libraries | Wrapper hell / HOCs            | Array composition `[type1, type2, {...}]` |
| Access internals           | Private - must fork            | Public - spread and override              |
| Type safety                | Props interface                | Entity schema + method signatures         |

**Users get complete control** without forking your library. They can override rendering, behavior, or both—down to individual methods.

---

## Using Third-Party Web Components

Inglorious Web works seamlessly with any Web Component library, such as Shoelace, Material Web Components, or Lion. Thanks to lit-html's efficient diffing algorithm, Web Components maintain their internal state even when the full tree re-renders - the component only updates when its properties change.

### ⚠️ SSG/SSR Considerations

**Inglorious Web's built-in components** (`table`, `list`, `select`, `form`) are fully compatible with [@inglorious/ssx](https://npmjs.com/package/@inglorious/ssx) for static site generation. They render to complete HTML at build time and hydrate seamlessly on the client.

**Third-party Web Components** currently have limited SSR/SSG support. Most Web Component libraries (including Shoelace and Material Web Components) require client-side JavaScript to initialize and render, which means:

- They won't appear in the pre-rendered HTML
- They're not SEO-friendly in their initial state
- They may cause FOUC (Flash of Unstyled Content)
- They should be treated as client-only enhancements

**Recommendation for SSX projects:**

- Use Inglorious Web components for content that needs to be pre-rendered (product listings, blog posts, documentation)
- Use Web Components for interactive, client-only features (color pickers, rich text editors, admin tools)

**Use Inglorious Web's built-in components when:**

- ✅ You want full architectural consistency
- ✅ You need fine-grained control over behavior
- ✅ You want to compose behaviors via type composition
- ✅ You need time-travel debugging of component state
- ✅ You want minimal bundle size
- ✅ You're building a core pattern used throughout your app
- ✅ You want the simplest possible tests
- ✅ You need custom behavior that third-party components don't provide
- ✅ You're using SSX for static site generation

**Use Web Components (like Shoelace) when:**

- ✅ You need complex, battle-tested UI (date pickers, rich text editors)
- ✅ You want a comprehensive design system out of the box
- ✅ Speed of development matters more than architectural purity
- ✅ You need features you don't want to build yourself (color pickers, tree views)
- ✅ The component is isolated or used infrequently
- ✅ You're okay with some state living outside the store
- ✅ You're building a client-only application (not using SSX)

### Example: Hybrid Approach

```javascript
import { table } from "@inglorious/web/table"
import "@shoelace-style/shoelace/dist/components/color-picker/color-picker.js"

const types = {
  // Inglorious Web component - full store integration
  productTable: {
    ...table,
    data: products,
    columns: [
      { id: "name", label: "Product Name" },
      { id: "price", label: "Price" },
    ],
  },

  // Web Component - for specialized UI
  themeEditor: {
    colorChange(entity, color) {
      entity.primaryColor = color
    },

    render(entity, api) {
      return html`
        <div>
          <label>Primary Color</label>
          <sl-color-picker
            value=${entity.primaryColor}
            @sl-change=${(e) =>
              api.notify("#themeEditor:colorChange", e.target.value)}
          ></sl-color-picker>
        </div>
      `
    },
  },
}
```

This hybrid approach gives you the best of both worlds: architectural consistency for core patterns, and battle-tested components for complex UI.

---

## Simplifying Entity Setup with `autoCreateEntities`

Let's be real: in a web app you very rarely need to create more than one entity for each type, and juggling between the types file and the entities file is annoying. That's why you can initialize the store with the `autoCreateEntities` flag, which will automatically create an entity with the same id as the type name.

```javascript
const types = {
  app: {
    render(entity, api) {
      return html`
        <div class="app">${api.render("header")} ${api.render("content")}</div>
      `
    },
  },

  header: {
    render(entity, api) {
      return html`<header>${entity.title}</header>`
    },
  },

  content: {
    render(entity, api) {
      return html`<main>${entity.text}</main>`
    },
  },
}

// Without autoCreateEntities - you need to define every entity
const entities = {
  app: { type: "app" },
  header: { type: "header", title: "Welcome" },
  content: { type: "content", text: "Hello World" },
}

// With autoCreateEntities - entities are created automatically
const store = createStore({
  types,
  entities: {}, // Can be empty!
  autoCreateEntities: true,
})
```

If you want to initialize an entity with specific data, you can use the `create()` event handler:

```javascript
const header = {
  create(entity) {
    entity.title = "Welcome"
  },

  render(entity, api) {
    return html`<header>${entity.title}</header>`
  },
}
```

The `create()` handler runs for each entity of that type is first created, making it perfect for setting up default values. This pattern works great for web apps where most entities are singletons that behave more like components than game objects.

**When to use `autoCreateEntities` in web apps:**

- ✅ Single-page applications with singleton services
- ✅ Component-like entities (headers, footers, navigation)
- ✅ Rapid prototyping where structure matters more than initial state
- ✅ Apps where you want to focus on behavior, not boilerplate

---

## API Reference

**`mount(store, renderFn, element)`**

Connects a store to a `lit-html` template and renders it into a DOM element. It automatically handles re-rendering on state changes.

**Parameters:**

- `store` (required): An instance of `@inglorious/store`.
- `renderFn(api)` (required): A function that takes an `api` object and returns a `lit-html` `TemplateResult` or `null`.
- `element` (required): The `HTMLElement` or `DocumentFragment` to render the template into.

**Returns:**

- `() => void`: An `unsubscribe` function to stop listening to store updates and clean up.

### The `api` Object

The `renderFn` receives a powerful `api` object that contains all methods from the store's API (`getEntities`, `getEntity`, `notify`, etc.) plus special methods for the web package.

**`api.render(id, options?)`**

This method is the cornerstone of entity-based rendering. It looks up an entity by its `id`, finds its corresponding type definition, and calls the `render(entity, api)` method on that type. This allows you to define rendering logic alongside an entity's other behaviors.

### Re-exported `lit-html` Utilities

For convenience, `@inglorious/web` re-exports the most common utilities from `@inglorious/store` and `lit-html`, so you only need one import.

```javascript
import {
  // from @inglorious/store
  createStore,
  createDevtools,
  compute,
  createSelector, // for Redux compatibility
  // from @inglorious/store/test
  trigger,
  // from lit-html
  mount,
  html,
  svg,
  // lit-html directives
  choose,
  classMap,
  ref,
  repeat,
  styleMap,
  unsafeHTML,
  when,
} from "@inglorious/web"

// Subpath imports for tree-shaking
import {
  form,
  getFieldError,
  getFieldValue,
  isFieldTouched,
} from "@inglorious/web/form"
import { list } from "@inglorious/web/list"
import { router } from "@inglorious/web/router"
import { select } from "@inglorious/web/select"
import { render, trigger } from "@inglorious/web/test"
import { table } from "@inglorious/web/table"
```

---

## Error Handling

When an entity's `render()` method throws an error, it can crash your entire app since the whole tree re-renders.

**Best practice:** Wrap your render logic in try-catch at the entity level:

```javascript
const myType = {
  render(entity, api) {
    try {
      // Your render logic
      return html`<div>...</div>`
    } catch (error) {
      console.error("Render error:", error)
      return html`<div class="error">Failed to render ${entity.id}</div>`
    }
  },
}
```

---

## Performance Tips

1. **Keep render() pure** - No side effects, no API calls
2. **Avoid creating new objects in render** - Use entity properties, not inline `{}`
3. **Use `repeat()` directive for lists** - Helps lit-html track item identity
4. **Profile with browser DevTools** - Look for slow renders (>16ms)
5. **Consider virtualization** - Use `list` type for 1000+ items

If renders are slow:

- Move expensive computations to event handlers
- Cache derived values on the entity
- ...Or memoize them!

---

## Relationship to Inglorious Engine

`@inglorious/web` shares its architectural philosophy with [Inglorious Engine](https://www.npmjs.com/package/@inglorious/engine):

- **Same state management** - Both use `@inglorious/store`
- **Same event system** - Entity behaviors respond to events
- **Same rendering model** - Full-state render on every update

The key difference:

- **@inglorious/engine** targets game loops (60fps, Canvas/WebGL rendering)
- **@inglorious/web** targets web UIs (DOM rendering, user interactions)

You can even mix them in the same app!

---

## Static Site Generation with SSX

For building **static HTML sites** with full pre-rendering, client-side hydration, and automatic sitemap/RSS generation, use [**@inglorious/ssx**](https://www.npmjs.com/package/@inglorious/ssx).

SSX is built entirely on **@inglorious/web** and lets you use the same entity-based patterns for both interactive apps and static sites, with:

- Pre-rendered HTML at build time
- Automatic code splitting and lazy loading
- Client-side hydration with lit-html
- File-based routing
- Sitemap and RSS feed generation
- Incremental builds

It's the perfect companion to @inglorious/web for building blazing-fast static sites, blogs, documentation, and marketing pages.

---

## Examples

Check out these demos to see `@inglorious/web` in action:

- **[Web TodoMVC](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-todomvc)** - A client-only TodoMVC implementation, a good starting point for learning the framework.
- **[Web TodoMVC-CS](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-todomvc-cs)** - A client-server version with JSON server, showing async event handlers and API integration with component organization (render/handlers modules).
- **[Web Form](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-form)** - Form handling with validation, arrays, and field helpers.
- **[Web List](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-list)** - Virtualized list with `renderItem` helper for efficient rendering of large datasets.
- **[Web Table](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-table)** - Table component with complex data display patterns.
- **[Web Router](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/web-router)** - Entity-based client-side routing with hash navigation.

---

## Related Packages

- [**@inglorious/ssx**](https://www.npmjs.com/package/@inglorious/ssx) - Static site generation with pre-rendering and client hydration
- [**@inglorious/store**](https://www.npmjs.com/package/@inglorious/store) - Entity-based state management (used by @inglorious/web)
- [**@inglorious/engine**](https://www.npmjs.com/package/@inglorious/engine) - Game engine with the same entity architecture
- [**@inglorious/create-app**](https://www.npmjs.com/package/@inglorious/create-app) - Scaffolding tool for quick project setup

---

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.

---

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](../../CONTRIBUTING.md) first.
