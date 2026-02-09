---
name: inglorious-forge
description: Build web apps and 2D games using the Inglorious ecosystem. Includes entity-based state management (@inglorious/store), lit-html rendering (@inglorious/web), and a functional game engine (@inglorious/engine). Use this skill to architect ECS-based applications, manage reactive state without proxies, and implement declarative charts or static sites.
metadata:
  version: "1.0.0"
---

# Inglorious Forge

A collection of small, focused JavaScript tools. Entity-based state management, lit-html rendering, functional game engine, and more. No signals, proxies, or complex abstractions.

## Core Philosophy

- **Plain JavaScript first** - Prefer standard JS over custom languages and DSLs
- **Simple, transparent, modular** - Keep modules small and understandable
- **Avoid build-time magic** - Let developers understand what happens under the hood
- **Composition over hierarchy** - Favor composition patterns
- **Small surface area** - Predictable, focused APIs

## Architecture Overview

```
@inglorious/web            → lit-html rendering + built-in components
@inglorious/ssx            → Static Site Generator (SSG) with hydration
@inglorious/vite-plugin-vue → Vue template syntax → lit-html
@inglorious/renderer-react-dom → React DOM renderer for engine
@inglorious/vite-plugin-jsx → JSX → lit-html compiler
@inglorious/charts         → Declarative charting library (Recharts-inspired)
@inglorious/store          → Entity state management (ECS-inspired, Redux-compatible)
@inglorious/utils          → Shared utility functions
@inglorious/engine         → Functional game engine (data-oriented)
@inglorious/react-store    → React bindings for store
@inglorious/renderer-2d    → 2D Canvas renderer for engine
@inglorious/create-app     → App scaffolding tool
@inglorious/create-game    → Game scaffolding tool
```

**Core principle:** Re-render everything → lit-html/React updates only changed DOM.

## Entity Pattern

Every entity has `type` + `id`. Types define behavior:

```javascript
const types = {
  typeName: {
    create(entity) {
      /* init */
    },
    destroy(entity) {
      /* cleanup */
    },
    eventName(entity, payload, api) {
      /* handler */
    },
    render(entity, api) {
      return html`...`
    },
  },
}
```

**Event targeting:**

```javascript
api.notify("event") // All entities
api.notify("type:event") // Only this type
api.notify("#id:event") // Only this id
api.notify("type#id:event") // Specific type and id
```

**Type composition:**

```javascript
// Single behavior
const counter = {
  increment(entity) {
    entity.value++
  },
}

// Multiple behaviors (array)
const types = {
  counter: [counter, withLogging, withValidation],
}

// Decorator pattern
const withLogging = (type) => ({
  render(entity, api) {
    console.log(`Rendering ${entity.id}`)
    return type.render(entity, api)
  },
})
```

## @inglorious/store

Redux-compatible, ECS-inspired state library. Entity-based architecture eliminates boilerplate.

**Quick example:**

```javascript
import { createStore } from "@inglorious/store"

const types = {
  counter: {
    increment(entity) {
      entity.value++
    },
    decrement(entity) {
      entity.value--
    },
  },
}

const entities = {
  counter1: { type: "counter", value: 0 },
  counter2: { type: "counter", value: 0 },
}

const store = createStore({ types, entities })

// Event targeting
store.notify("increment") // All entities
store.notify("counter:increment") // Only counter type
store.notify("#counter1:increment") // Only specific entity
```

**Key features:**

- Redux-compatible API (works with `react-redux` and Redux DevTools)
- Entity-based state (multiple instances without code changes)
- Lifecycle events (`create`, `destroy`)
- Async handlers with event queue
- Systems for global logic
- Behavior composition (decorator pattern)
- Uses Mutative for immutable updates (faster than Immer)

**Redux Compatibility:**

- ✅ Compatible with `react-redux` Provider/useSelector/useDispatch
- ✅ Compatible with Redux DevTools
- ✅ Compatible with Redux-style `dispatch({ type, payload })`
- ⚠️ Redux middlewares (Redux-Saga, Redux-Thunk) may require adaptation
- ⚠️ Use `api.notify()` for event-driven updates (preferred over `dispatch`)

**📖 Complete reference:** [Store API](references/store.md) - State management, async operations, systems, testing

## @inglorious/web

Small view layer built around `lit-html` and the entity store. No components, no lifecycles — just functions that return templates.

**Quick example:**

```javascript
import { createStore, mount, html } from "@inglorious/web"

const types = {
  counter: {
    increment(entity) {
      entity.value++
    },
    render(entity, api) {
      return html`
        <button @click=${() => api.notify(`#${entity.id}:increment`)}>
          Count: ${entity.value}
        </button>
      `
    },
  },
}

const entities = { counter1: { type: "counter", value: 0 } }
const store = createStore({ types, entities })

mount(store, (api) => api.render("counter1"), document.getElementById("root"))
```

**Built-in components:**

- `form` - Forms with validation
- `table` - Data tables
- `select` - Dropdowns
- `list` - Virtualized lists
- `router` - Client-side routing

**📖 Complete reference:** [Web Component API](references/web.md) - Rendering, components, testing, API reference

## @inglorious/engine

Modular game engine built on the same entity model as the store. Designed for 2D games with a focus on simplicity and composability.

**Quick example:**

```javascript
import { Engine } from "@inglorious/engine/core/engine"
import { createRenderer } from "@inglorious/renderer-2d"

const game = {
  types: {
    player: {
      update(entity, deltaTime) {
        entity.position.x += entity.velocity.x * deltaTime
        entity.position.y += entity.velocity.y * deltaTime
      },
    },
  },
  entities: {
    player1: {
      type: "player",
      position: { x: 0, y: 0 },
      velocity: { x: 100, y: 0 },
    },
  },
}

const canvas = document.getElementById("canvas")
const renderer = createRenderer(canvas)
const engine = new Engine(renderer, game)

await engine.init()
engine.start()
```

**Key features:**

- Functional & data-oriented (single immutable state)
- Composable behaviors (composition over inheritance)
- Renderer agnostic (Canvas2D, React, HTML)
- Zero build step option
- Entity pooling for performance
- Optional IngloriousScript for vector math (requires Babel plugin)

**Rules:**

- Use `update` event handler for frame-based logic (receives `deltaTime`)
- Entity mutations in handlers are safe (store uses Mutative)
- Use `api.notify()` to trigger events between entities
- Systems run after all entity handlers for global coordination

**📖 Complete reference:** [Engine API](references/engine.md) - Game engine, renderers, entity pooling, IngloriousScript

## @inglorious/charts

Declarative charting library for Inglorious Web, inspired by Recharts. Supports two rendering modes: Config-first (declarative) and Composition (Recharts-style).

**Config-first mode:**

```javascript
import { lineChart } from "@inglorious/charts"

const types = { line: lineChart }
const entities = {
  myChart: {
    type: "line",
    data: [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
  },
}
```

**Composition mode (Recharts-style):**

```javascript
import { chart, charts } from "@inglorious/charts"

// Register chart type in store
const store = createStore({
  types: {
    line: lineChart,
    chart: charts, // Required for chart() helper
  },
  entities,
})

// Use in component
${chart(api, "myChart", (c) =>
  c.renderLineChart([
    c.renderCartesianGrid({ stroke: "#eee" }),
    c.renderXAxis({ dataKey: "name" }),
    c.renderYAxis({ width: "auto" }),
    c.renderLine({ dataKey: "value", stroke: "#8884d8" }),
    c.renderTooltip({}),
  ], { width: 800, height: 400, dataKeys: ["value"] })
)}
```

**Chart types:** Line, Area, Bar, Pie, Donut

**CRITICAL Rules for Composition Mode:**

1. **Sub-components MUST use `ctx` (CartesianContext)** - Never access `entity.data` directly
2. **Use `ctx.displayData` for rendering** - Contains filtered data when Zoom/Brush is active
3. **Use `ctx.xScale` and `ctx.yScale` for positioning** - Already configured with correct domains
4. **Brush requires full `entity.data` for preview** - But chart rendering uses `ctx.displayData`
5. **Config mode handles filtering automatically** - Composition mode requires explicit context usage

**📖 Complete reference:** [Charts API](references/charts.md) - Chart types, composition components, context usage, brush

## @inglorious/ssx

Static Site Generator for `@inglorious/web`. Includes server-side rendering, client-side hydration, and file-based routing.

**Quick example:**

```javascript
// src/pages/index.js
import { html } from "@inglorious/web"

export const index = {
  render() {
    return html`
      <div>
        <h1>Welcome to SSX!</h1>
        <p>This page was pre-rendered at build time.</p>
      </div>
    `
  },
}

export const metadata = {
  title: "Home",
  meta: { description: "Welcome" },
}
```

**Features:**

- Pre-rendered HTML (SSG)
- Client-side hydration with lit-html
- File-based routing
- Automatic code splitting
- Markdown support
- Image optimization
- Sitemap & RSS generation

**Rules:**

- Pages are files in `src/pages/` directory
- Dynamic routes use underscore prefix: `_id.js`, `_slug.js`
- Export `load()` function for data loading at build time
- Export `staticPaths()` for dynamic route generation
- Export `metadata` for page metadata (can be function or object)

**📖 Complete reference:** [SSX API](references/ssx.md) - File-based routing, data loading, markdown, deployment

## Build Tools

### @inglorious/vite-plugin-vue

Transform Vue-like template syntax into lit-html templates. **Not Vue.js** - compiles to lit-html, no Vue runtime.

**CRITICAL:** The plugin compiles template expressions and event handlers to use `api.notify()` automatically. Direct mutations in `<script>` are compiled to event handlers that update state through the store.

```javascript
// vite.config.js
import vue from "@inglorious/vite-plugin-vue"
export default { plugins: [vue()] }
```

```vue
<template>
  <div>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<script>
// Variables become entity properties via create() lifecycle
let count = 0

// Functions become event handlers that use api.notify()
// The plugin compiles this to: api.notify(`#${entity.id}:increment`)
const increment = (entity) => {
  entity.count++ // This mutation is wrapped in store's immutability system
}
</script>
```

**Rule:** Always use event handlers for state changes. The plugin compiles `@click="increment"` to `api.notify(\`#${entity.id}:increment\`)`, ensuring reactivity through the store.

**📖 Complete reference:** [Vue Plugin](references/vue-plugin.md) - Template syntax, compilation details, examples

### @inglorious/vite-plugin-jsx

Compiles standard JSX/TSX into optimized `lit-html` templates. Requires proper Vite configuration.

### @inglorious/babel-plugin-inglorious-script

**Optional:** IngloriousScript adds vector operators for 2D game development. Requires Babel configuration.

**WARNING:** Only use IngloriousScript if the plugin is properly configured. Without the plugin, vector operators (`position + velocity`) will cause runtime errors.

```javascript
// Without IngloriousScript (standard JavaScript)
const newPosition = mod(add(position, scale(velocity, dt)), worldSize)

// With IngloriousScript (requires babel-plugin-inglorious-script)
const newPosition = (position + velocity * dt) % worldSize
```

**Rule:** Always verify Babel configuration before using IngloriousScript operators. Use standard vector math functions if the plugin is not available.

## Renderers

### @inglorious/renderer-2d

2D renderer using HTML5 Canvas Context2D API. Exports `createRenderer(canvas)` which returns renderer configuration:

```javascript
import { createRenderer } from "@inglorious/renderer-2d"

const canvas = document.getElementById("canvas")
const renderer = createRenderer(canvas)
// Returns { types, entities, systems } to pass to Engine
```

### @inglorious/renderer-react-dom

React DOM renderer, allowing React components as renderers for the game engine.

## CLI Tools

### @inglorious/create-app

Scaffolding tool for web applications:

```bash
npm create @inglorious/app@latest
```

Templates: minimal, JS (Vite), TS (Vite + TypeScript), SSX (static site)

### @inglorious/create-game

Scaffolding tool for game projects:

```bash
npm create @inglorious/game@latest
```

Templates: minimal, JS, TS, IJS (IngloriousScript), ITS (IngloriousScript + TypeScript)

## React Integration

### @inglorious/react-store

Official React bindings for `@inglorious/store`:

```javascript
import { createStore } from "@inglorious/store"
import { createReactStore } from "@inglorious/react-store"

const store = createStore({ types, entities })
export const { Provider, useSelector, useNotify } = createReactStore(store)

function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  )
}

function Counter() {
  const notify = useNotify()
  const count = useSelector((state) => state.counter1.value)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => notify("increment")}>+</button>
    </div>
  )
}
```

**Redux Compatibility:**

- Works with `react-redux` Provider/useSelector/useDispatch hooks
- Compatible with Redux DevTools
- Supports Redux-style `dispatch({ type, payload })` for migration
- Prefer `api.notify()` for new code (cleaner API)

## Other Packages

- **@inglorious/utils** - Shared utility functions (vector math, data manipulation)
- **@inglorious/logo** - Logo component library
- **@inglorious/server** - Simple WebSocket server for realtime state sync
- **@inglorious/editor** - Graphical UI for Inglorious Engine (experimental)
- **@inglorious/jsx** - JSX runtime
- **@inglorious/eslint-config** - Shared ESLint configuration

## Common Patterns

### Async Operations

```javascript
const types = {
  todos: {
    async loadItems(entity, _, api) {
      entity.loading = true
      const response = await fetch("/api/todos")
      const data = await response.json()
      api.notify("itemsLoaded", data)
    },
    itemsLoaded(entity, items) {
      entity.items = items
      entity.loading = false
    },
  },
}
```

### Systems (Global Logic)

```javascript
const systems = [
  {
    taskCompleted(state, taskId) {
      const allTodos = Object.values(state)
        .filter((e) => e.type === "todoList")
        .flatMap((e) => e.todos)
      state.stats.total = allTodos.length
      state.stats.completed = allTodos.filter((t) => t.completed).length
    },
  },
]

const store = createStore({ types, entities, systems })
```

### Derived State

```javascript
import { compute } from "@inglorious/store"

const selectResult = compute(
  (count, multiplier) => count * multiplier,
  [(state) => state.counter1.value, (state) => state.settings.multiplier],
)
```

## Testing

```javascript
import { trigger } from "@inglorious/store/test"

const { entity, events } = trigger(
  { type: "counter", id: "counter1", value: 10 },
  increment,
  { amount: 5 },
)
expect(entity.value).toBe(15)
```

## Rules & Constraints

### State Management Rules

1. **ALWAYS use `api.notify()` for state changes** - Direct mutations outside event handlers will not trigger re-renders
2. **NEVER mutate state outside event handlers** - State changes must go through the store's event system
3. **Event handlers receive `(entity, payload, api)`** - Use `api` to access other entities or trigger events
4. **Entity mutations inside handlers are safe** - The store uses Mutative for immutability, so `entity.value++` is fine inside handlers
5. **Use lifecycle events (`create`, `destroy`) for setup/cleanup** - Not for regular state updates

### Charts Rules

1. **In Composition mode, sub-components MUST use `ctx` (CartesianContext)** - Never access `entity.data` directly
2. **Use `ctx.displayData` for rendering** - This contains filtered data when Zoom/Brush is active
3. **Use `ctx.xScale` and `ctx.yScale` for positioning** - These are already configured with correct domains
4. **Brush requires full `entity.data` for preview** - But chart rendering uses `ctx.displayData`
5. **Config mode handles filtering automatically** - Composition mode requires explicit context usage

### Vue Plugin Rules

1. **Template expressions compile to entity properties** - `{{ count }}` becomes `${entity.count}`
2. **Event handlers compile to `api.notify()`** - `@click="increment"` becomes `api.notify(\`#${entity.id}:increment\`)`
3. **Script variables become entity properties** - `let count = 0` becomes `entity.count = 0` in `create()`
4. **Functions become event handlers** - Must accept `(entity, payload, api)` signature
5. **Mutations in handlers are safe** - The plugin wraps them in the store's immutability system

### Redux Compatibility Rules

1. **Use `react-redux` Provider/useSelector/useDispatch** - Works as expected
2. **Redux DevTools work** - Store is Redux-compatible
3. **Redux middlewares may need adaptation** - Redux-Saga, Redux-Thunk may require wrapper
4. **Prefer `api.notify()` over `dispatch()`** - Cleaner API, same functionality
5. **Store state shape is flat** - Entities are top-level keys, not nested reducers

## Common Pitfalls

### ❌ Wrong: Direct mutation outside handler

```javascript
// This will NOT trigger re-render
const entity = api.getEntity("counter1")
entity.value++ // Wrong - no re-render
```

### ✅ Correct: Use api.notify()

```javascript
api.notify("#counter1:increment") // Correct - triggers re-render
```

### ❌ Wrong: Using entity.data directly in Charts Composition

```javascript
c.renderLineChart([
  c.renderLine({
    dataKey: "value",
    // Wrong - uses entity.data directly, breaks Zoom/Brush
  }),
])
```

### ✅ Correct: Use ctx.displayData from context

```javascript
// The chart component automatically provides ctx with displayData
// Sub-components receive ctx and use ctx.displayData
c.renderLineChart([
  c.renderLine({
    dataKey: "value",
    // Correct - uses ctx.displayData from parent context
  }),
])
```

### ❌ Wrong: IngloriousScript without plugin

```javascript
// This will crash if babel-plugin-inglorious-script is not configured
const pos = position + velocity * dt // Error: + operator not defined for objects
```

### ✅ Correct: Use standard vector functions

```javascript
import { add, scale, mod } from "@inglorious/utils"
const pos = mod(add(position, scale(velocity, dt)), worldSize)
```

### ❌ Wrong: Vue template with local variables

```vue
<script>
let count = 0 // This becomes entity.count, not a local variable
const increment = () => {
  count++ // Wrong - this won't work as expected
}
</script>
```

### ✅ Correct: Vue template with entity mutations

```vue
<script>
let count = 0 // Becomes entity.count in create()
const increment = (entity) => {
  entity.count++ // Correct - mutation in handler
}
</script>
```

## References

- [Store API](references/store.md) - Complete state management reference
- [Web Component API](references/web.md) - Complete rendering and components reference
- [Engine API](references/engine.md) - Complete game engine reference
- [Charts API](references/charts.md) - Complete charting library reference
- [SSX API](references/ssx.md) - Complete static site generator reference
- [Vue Plugin](references/vue-plugin.md) - Complete template syntax and compilation reference

## Philosophy

- **Clarity over cleverness**
- **Plain JavaScript first**
- **Minimal abstractions**
- **Small, focused modules**
- **Opt into complexity only when needed**
