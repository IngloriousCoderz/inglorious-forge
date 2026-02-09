# @inglorious/web - Complete Reference

## Installation

```bash
npm install @inglorious/web
```

## Core Concepts

**Architecture:** Re-render everything → let lit-html update only what changed.

- No signals, proxies, or compilers
- Explicit state transitions
- All state lives in the store, never in components

**Rules:**

- ALWAYS use `api.notify()` for state changes - Direct mutations won't trigger re-renders
- NEVER store state in component closures - All state must be in entities
- Event handlers are called with `(entity, payload, api)` - You can omit unused parameters in the function definition
- Mutations inside handlers are safe - Store uses Mutative for immutability

## Basic Setup

### Store Definition

```javascript
import { createStore, html } from "@inglorious/web"

const types = {
  counter: {
    // Handler with only entity (payload and api are passed but can be omitted)
    increment(entity) {
      entity.value++
    },

    // Handler with entity and payload
    set(entity, newValue) {
      entity.value = newValue
    },

    // Handler with all three parameters
    reset(entity, _, api) {
      api.notify("set", 0)
    },

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
}

export const store = createStore({ types, entities })
```

### Mounting

```javascript
import { mount, html } from "@inglorious/web"
import { store } from "./store.js"

const renderApp = (api) => {
  return html`
    <h1>App</h1>
    ${api.render("counter1")}
  `
}

mount(store, renderApp, document.getElementById("root"))
```

## Type Composition

Types are composable as arrays of behaviors:

```javascript
const logging = (type) => ({
  render(entity, api) {
    console.log(`Rendering ${entity.id}`)
    return type.render(entity, api)
  },
})

const types = {
  counter: [counterBase, logging],
}
```

## Built-in Components

### Form

```javascript
import {
  form,
  getFieldValue,
  getFieldError,
  isFieldTouched,
} from "@inglorious/web/form"

const entities = {
  myForm: {
    type: "form",
    initialValues: { name: "", email: "" },
  },
}
```

**Events:**

- `#<id>:fieldChange` - Set field value
- `#<id>:fieldBlur` - Mark field touched
- `#<id>:validate` - Sync validation
- `#<id>:validateAsync` - Async validation
- `#<id>:submit` - Submit form

### Table

```javascript
import { table } from "@inglorious/web/table"
import "@inglorious/web/table/base.css"
import "@inglorious/web/table/theme.css"

const productTable = {
  ...table,
  data: [{ id: 1, name: "Product A", price: 100 }],
  columns: [
    { id: "id", label: "ID" },
    { id: "name", label: "Name" },
  ],
  renderValue(value, column) {
    return formatters[column.formatter]?.(value) ?? value
  },
}
```

### Select

```javascript
import { select } from "@inglorious/web/select"
import "@inglorious/web/select/base.css"
import "@inglorious/web/select/theme.css"

const countrySelect = {
  type: "select",
  options: [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
  ],
  isMulti: false,
  isSearchable: true,
  placeholder: "Select...",
}
```

### Virtualized List

```javascript
import { list } from "@inglorious/web/list"

const productList = {
  ...list,
  renderItem(item, index) {
    return html`<div>${index}: <strong>${item.name}</strong></div>`
  },
}

const entities = {
  products: {
    type: "list",
    items: Array.from({ length: 10000 }, (_, i) => ({ name: `Product ${i}` })),
    viewportHeight: 400,
    estimatedHeight: 40,
    bufferSize: 5,
  },
}
```

### Router

```javascript
import { router, setRoutes } from "@inglorious/web/router"

const types = { router, homePage, userPage, notFoundPage }
const entities = { router: { type: "router" } }

setRoutes({
  "/": "homePage",
  "/users/:id": "userPage",
  "*": "notFoundPage",
})

const renderApp = (api) => {
  const { route } = api.getEntity("router")
  return html`
    <nav><a href="/">Home</a></nav>
    <main>${route ? api.render(route) : ""}</main>
  `
}

// Navigation
api.notify("navigate", "/users/456")
api.notify("navigate", { to: "/users/456", replace: true })
```

### Route Guards

```javascript
const requireAuth = (type) => ({
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return
    const user = localStorage.getItem("user")
    if (!user) {
      api.notify("navigate", { to: "/login", replace: true })
      return
    }
    type.routeChange?.(entity, payload, api)
  },
})

const types = {
  adminPage: [adminPageBase, requireAuth],
}
```

## Selectors

Use `api.select(selector)` to run selector functions against the current state. This allows selectors to be named naturally and facilitates access to data from any entity during render.

```javascript
// 1. Define selectors (pure functions)
const count = (state) => state.counter1.value
const userRole = (state) => state.session.role // Accessing a different entity ('session')

// 2. Use in render
const page = {
  render(entity, api) {
    const currentCount = api.select(count)
    const role = api.select(userRole)

    return html`
      <div>
        <p>Count: ${currentCount}</p>

        ${role === "admin"
          ? html`<button @click=${() => api.notify("admin:action")}>
              Admin Panel
            </button>`
          : html`<span>Standard User</span>`}
      </div>
    `
  },
}
```

**Benefits:**

- Simpler API: `api.select(value)` instead of `value(api.getEntities())`
- Natural naming: Selectors can be named `value` instead of `selectValue`
- Cleaner code: Less verbose than manually calling selectors with state

## Testing

```javascript
import { trigger, render } from "@inglorious/web/test"

// Test handlers
const { entity, events } = trigger(
  { type: "counter", id: "counter1", value: 10 },
  counter.increment,
  { amount: 5 },
)
expect(entity.value).toBe(15)

// Test rendering
const template = counter.render(entity, { notify: jest.fn() })
const html = render(template)
expect(html).toContain("Count: 42")
```

## Redux DevTools

```javascript
import { createDevtools } from "@inglorious/web"

const middlewares = []
if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}

export const store = createStore({ types, entities, middlewares })
```

## Auto-Creating Entities

```javascript
const types = {
  header: {
    create(entity) {
      entity.title = "Welcome"
    },
    render: (entity, api) => html`<header>${entity.title}</header>`,
  },
}

const store = createStore({
  types,
  entities: {},
  autoCreateEntities: true,
})
```

## API Reference

### `mount(store, renderFn, element)`

Connect store to DOM. Returns unsubscribe function.

### `api` Object Methods

- `api.render(id, options?)` - Render entity by id
- `api.getEntity(id)` - Get entity state (read-only snapshot)
- `api.getEntities()` - Get all entities (read-only snapshot)
- `api.select(selector)` - Run selector function against current state
- `api.notify(event, payload)` - Dispatch event (preferred method)
- `api.getTypes()` - Get all type definitions
- `api.getType(name)` - Get specific type

**Rules:**

- ALWAYS use `api.notify()` for state changes - Format: `api.notify("#id:event", payload)`
- `api.getEntity()` returns read-only - Mutations won't trigger re-renders
- Event targeting: `"event"` (all), `"type:event"` (type), `"#id:event"` (specific entity)
- Mutations inside event handlers are safe - Store handles immutability automatically

### Exports

```javascript
import {
  createStore,
  createDevtools,
  compute, // store
  mount,
  html,
  svg, // lit-html
  choose,
  classMap,
  ref,
  repeat, // directives
  styleMap,
  unsafeHTML,
  when,
} from "@inglorious/web"

// Subpath imports
import {
  form,
  getFieldError,
  getFieldValue,
  isFieldTouched,
} from "@inglorious/web/form"
import { list } from "@inglorious/web/list"
import { router } from "@inglorious/web/router"
import { select } from "@inglorious/web/select"
import { table } from "@inglorious/web/table"
import { render, trigger } from "@inglorious/web/test"
```

## Common Pitfalls

### ❌ Wrong: Direct mutation outside handler

```javascript
const types = {
  counter: {
    render(entity, api) {
      // Wrong - mutation outside handler won't trigger re-render
      entity.value++
      return html`<div>${entity.value}</div>`
    },
  },
}
```

### ✅ Correct: Use api.notify() in event handlers

```javascript
const types = {
  counter: {
    increment(entity) {
      entity.value++ // Correct - mutation in handler
    },
    render(entity, api) {
      return html`
        <div>${entity.value}</div>
        <button @click=${() => api.notify(`#${entity.id}:increment`)}>+</button>
      `
    },
  },
}
```

### ❌ Wrong: Storing state in closures

```javascript
// Wrong - state in closure, not in entity
let count = 0
const types = {
  counter: {
    render() {
      return html`<div>${count}</div>` // Wrong - won't trigger re-render
    },
  },
}
```

### ✅ Correct: Store state in entities

```javascript
const entities = {
  counter1: { type: "counter", value: 0 }, // Correct - state in entity
}
const types = {
  counter: {
    render(entity) {
      return html`<div>${entity.value}</div>` // Correct - triggers re-render
    },
  },
}
```
