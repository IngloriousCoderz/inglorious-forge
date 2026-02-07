# Inglorious Store

[![NPM version](https://img.shields.io/npm/v/@inglorious/store.svg)](https://www.npmjs.com/package/@inglorious/store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Redux-compatible, ECS-inspired state library that makes state management as elegant as game logic.

**Drop-in replacement for Redux.** Works with `react-redux` and Redux DevTools. Borrows concepts from Entity-Component-System architectures and Functional Programming to provide an environment where you can write simple, predictable, and testable code.

```javascript
// from redux
import { createStore } from "redux"
// to
import { createStore } from "@inglorious/store"
```

---

## Why Inglorious Store?

Redux is powerful but verbose. You need action creators, reducers, middleware for async operations, and a bunch of decisions about where logic should live. Redux Toolkit cuts the boilerplate, but you're still writing a lot of ceremony.

Inglorious Store eliminates the boilerplate entirely with an **entity-based architecture** inspired by game engines. Some of the patterns that power AAA games now power your state management.

Game engines solved state complexity years ago — Inglorious Store brings those lessons to web development.

**Key benefits:**

- ✅ Drop-in Redux replacement (same API with `react-redux`)
- ✅ Entity-based state (manage multiple instances effortlessly)
- ✅ No action creators, thunks, or slices
- ✅ Predictable, testable, purely functional code
- ✅ Built-in lifecycle events (`add`, `remove`)
- ✅ 10x faster immutability than Redux Toolkit (Mutative vs Immer)

---

## Quick Comparison: Redux vs RTK vs Inglorious Store

### Redux

```javascript
// Action creators
const addTodo = (text) => ({ type: "ADD_TODO", payload: text })

// Reducer
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { id: Date.now(), text: action.payload }]

    case "OTHER_ACTION":
    // Handle other action

    default:
      return state
  }
}

// Store setup
const store = configureStore({
  reducer: {
    work: todosReducer,
    personal: todosReducer,
  },
})

store.dispatch({ type: "ADD_TODO", payload: "Buy groceries" })
store.dispatch({ type: "OTHER_ACTION" })
```

### Redux Toolkit

```javascript
const otherAction = createAction("app:otherAction")

const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ id: Date.now(), text: action.payload })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(otherAction, (state, action) => {
      // Handle external action
    })
  },
})

const store = configureStore({
  reducer: {
    work: todosSlice.reducer,
    personal: todosSlice.reducer,
  },
})

store.dispatch(slice.actions.addTodo("Buy groceries"))
store.dispatch(otherAction())
```

### Inglorious Store

```javascript
// Define entity types and their behavior
const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text })
    },

    otherAction(entity) {
      // Handle other action
    },
  },
}

// Define initial entities
const entities = {
  work: { type: "todoList", todos: [] },
  personal: { type: "todoList", todos: [] },
}

// Create store
const store = createStore({ types, entities })

store.dispatch({ type: "addTodo", payload: "Buy groceries" })
store.dispatch({ type: "otherAction" })

// or, even better:
store.notify("addTodo", "Buy groceries")
store.notify("otherAction")

// same result, 10x simpler
```

**Key differences:**

- ❌ No action creators
- ❌ No switch statements or cases
- ❌ No slice definitions with extraReducers
- ✅ Define what each entity type can do
- ✅ Add multiple instances by adding entities, not code

---

## Core Concepts

### 🎮 Entities and Types

State consists of **entities** (instances) that have a **type** (behavior definition). Think of a type as a class and entities as instances:

```javascript
const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text })
    },
    toggle(entity, id) {
      const todo = entity.todos.find((t) => t.id === id)
      if (todo) todo.completed = !todo.completed
    },
  },

  settings: {
    setTheme(entity, theme) {
      entity.theme = theme
    },
  },
}

const entities = {
  workTodos: { type: "todoList", todos: [], priority: "high" },
  personalTodos: { type: "todoList", todos: [], priority: "low" },
  settings: { type: "settings", theme: "dark", language: "en" },
}
```

**Why this matters:**

- Same behavior applies to all instances of that type
- No need to write separate code for each instance
- Your mental model matches your code structure

### 🔄 Event Handlers (Not Methods)

Even though it looks like types expose methods, they are actually **event handlers**, very similar to Redux reducers. There are a few differences though:

1. Just like RTK reducers, you can mutate the entity directly since event handlers are using an immutability library under the hood. Not Immer, but Mutative — which claims to be 10x faster than Immer.

```javascript
const types = {
  counter: {
    increment(counter) {
      counter.value++ // Looks like mutation, immutable in reality
    },
  },
}
```

2. Event handlers accept as arguments the current entity, the event payload, and an API object that exposes a few convenient methods:

```javascript
const types = {
  counter: {
    increment(counter, value, api) {
      api.getEntities() // access the whole state in read-only mode
      api.getEntity(id) // access some other entity in read-only mode
      api.select(selector) // run a selector against the whole state
      api.notify(type, payload) // similar to dispatch. Yes, you can dispatch inside of a reducer!
      api.dispatch(action) // optional, if you prefer Redux-style dispatching
    },
  },
}
```

---

## Installation & Setup

The Inglorious store, just like Redux, can be used standalone. However, it's commonly used together with component libraries such as React.

### Basic Setup with `react-redux`

```javascript
import { createStore } from "@inglorious/store"
import { Provider, useSelector, useDispatch } from "react-redux"

// 1. Define entity types
const types = {
  counter: {
    increment(counter) {
      counter.value++
    },
    decrement(counter) {
      counter.value--
    },
  },
}

// 2. Define initial entities
const entities = {
  counter1: { type: "counter", value: 0 },
}

// 3. Create the store
const store = createStore({ types, entities })

// 4. Provide the store with react-redux
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}

// 5. Wire components to the store
function Counter() {
  const dispatch = useDispatch()
  const count = useSelector((state) => state.counter1.value)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </div>
  )
}
```

### With `@inglorious/react-store` (Recommended)

For React applications, `@inglorious/react-store` provides a set of hooks and a Provider that are tightly integrated with the store. It's a lightweight wrapper around `react-redux` that offers a more ergonomic API.

```javascript
import { createStore } from "@inglorious/store"
import { createReactStore } from "@inglorious/react-store"

const store = createStore({ types, entities })

export const { Provider, useSelector, useNotify } = createReactStore(store)

function App() {
  return (
    // No store prop needed!
    <Provider>
      <Counter />
    </Provider>
  )
}

function Counter() {
  const notify = useNotify() // less verbose than dispatch
  const count = useSelector((state) => state.counter1.value)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => notify("increment")}>+</button> // simplified
      syntax
      <button onClick={() => notify("decrement")}>-</button>
    </div>
  )
}
```

The package is fully typed, providing a great developer experience with TypeScript.

---

## Core Features

### 🎮 Entity-Based State

The real power: add entities dynamically without code changes.

**Redux/RTK:** To manage three counters, you can reuse a reducer. But what if you want to add a new counter at runtime? Your best option is probably to reshape the whole state.

```javascript
// The original list of counters:
const store = configureStore({
  reducer: {
    counter1: counterReducer,
    counter2: counterReducer,
    counter3: counterReducer,
  },
})

// becomes:
const store = configureStore({
  reducer: {
    counters: countersReducer,
  },
})

// with extra actions to manage adding/removing counters:
store.dispatch({ type: "addCounter", payload: "counter4" })
```

**Inglorious Store** makes it trivial:

```javascript
const types = {
  counter: {
    increment(entity) {
      entity.value++
    },
  },
}

const entities = {
  counter1: { type: "counter", value: 0 },
  counter2: { type: "counter", value: 0 },
  counter3: { type: "counter", value: 0 },
}

store.notify("add", { id: "counter4", type: "counter", value: 0 })
```

Inglorious Store has a few built-in events that you can use:

- `add`: adds a new entity to the state. Triggers a `create` lifecycle event.
- `remove`: removes an entity from the state. Triggers a `destroy` lifecycle event.

The lifecycle events can be used to define event handlers similar to constructor and destructor methods in OOP:

> Note: these special lifecycle events are not broadcast: they are visible only to the added/removed entity!

```javascript
const types = {
  counter: {
    create(entity) {
      entity.createdAt = Date.now()
    },

    destroy(entity) {
      entity.destroyedAt = Date.now()
    },
  },
}
```

### 🔊 Event Broadcasting

Events are broadcast to all entities via pub/sub. Every entity handler receives every event of that type, just like it does in Redux.

```javascript
const types = {
  todoList: {
    taskCompleted(entity, taskId) {
      const task = entity.tasks.find((t) => t.id === taskId)
      if (task) task.completed = true
    },
  },
  stats: {
    taskCompleted(entity, taskId) {
      entity.completedCount++
    },
  },
  notifications: {
    taskCompleted(entity, taskId) {
      entity.messages.push("Nice! Task completed.")
    },
  },
}

// One notify call, all three entity types respond
store.notify("taskCompleted", "task123")
```

In RTK, such action would have be to be defined outside of the slice with `createAction` and then processed with the builder callback notation inside of the `extraReducers` section.

- What if you want to notify the event only to entities of one specific type? Define an event handler for that event only on that type.
- What if you want to notify the event only on one entity of that type? Add an if that checks if the entity should be bothered or not by it.

```javascript
const types = {
  todoList: {
    toggle(entity, id) {
      // This runs for EVERY todoList entity, but only acts if it's the right one
      if (entity.id !== id) return

      const todo = entity.todos.find((t) => t.id === id)
      if (todo) todo.completed = !todo.completed
    },
  },
}

// Broadcast to all todo lists
store.notify("toggle", "todo1")
// Each list's toggle handler runs; only the one with todo1 actually updates
```

Alternatively, you can use the **targeted notification syntax** to filter events at the dispatch level:

- `notify("type:event")`: notifies only entities of a specific type.
- `notify("#id:event")`: notifies only a specific entity by ID.
- `notify("type#id:event")`: notifies a specific entity of a specific type.

```javascript
const types = {
  todoList: {
    toggle(entity) {
      const todo = entity.todos.find((t) => t.id === entity.id)
      if (todo) todo.completed = !todo.completed
    },
  },
}

// Notify only the entity with ID 'work'
store.notify("#todo1:toggle")
```

### ⚡ Async Operations

In **Redux/RTK**, logic should be written inside pure functions as much as possible — specifically in reducers, not action creators. But what if I need to access some other part of the state that is not visible to the reducer? What if I need to combine async behavior with sync behavior? This is where the choice of "where does my logic live?" matters.

In **Inglorious Store:** your event handlers can be async, and you get deterministic behavior automatically. Inside an async handler, you can access other parts of state (read-only), and you can trigger other events via `api.notify()`. Even if we give up on some purity, everything still maintains predictability because of the underlying **event queue**:

```javascript
const types = {
  todoList: {
    async loadTodos(entity, payload, api) {
      try {
        entity.loading = true
        const { name } = api.getEntity("user")
        const response = await fetch(`/api/todos/${name}`)
        const data = await response.json()
        api.notify("todosLoaded", todos)
      } catch (error) {
        api.notify("loadFailed", error.message)
      }
    },

    todosLoaded(entity, todos) {
      entity.todos = todos
      entity.loading = false
    },

    loadFailed(entity, error) {
      entity.error = error
      entity.loading = false
    },
  },
}
```

Notice: you don't need pending/fulfilled/rejected actions. You stay in control of the flow — no hidden action chains. The `api` object passed to handlers provides:

- **`api.getEntities()`** - read entire state
- **`api.getEntity(id)`** - read one entity
- **`api.select(selector)`** - run a selector against the state
- **`api.notify(type, payload)`** - trigger other events (queued, not immediate)
- **`api.dispatch(action)`** - optional, if you prefer Redux-style dispatching
- **`api.getTypes()`** - access type definitions (mainly for middleware/plugins)
- **`api.getType(typeName)`** - access type definition (mainly for overrides)

All events triggered via `api.notify()` enter the queue and process together, maintaining predictability and testability.

### `handleAsync`

The `handleAsync` helper generates a set of event handlers representing the lifecycle of an async operation.

```ts
handleAsync(type, handlers, options?)
```

Example:

```ts
handleAsync("fetchTodos", {
  async run(payload) {
    const res = await fetch("/api/todos")
    return res.json()
  },

  success(entity, todos) {
    entity.todos = todos
  },

  error(entity, error) {
    entity.error = error.message
  },

  finally(entity) {
    entity.loading = false
  },
})
```

---

### Lifecycle events

Triggering `fetchTodos` emits the following events:

```
fetchTodos
fetchTodosRun
fetchTodosSuccess | fetchTodosError
fetchTodosFinally
```

Each step is an **event handler**, not an implicit callback.

---

### Optional `start` handler

Use `start` for synchronous setup (loading flags, resets, optimistic state):

```ts
handleAsync("save", {
  start(entity) {
    entity.loading = true
  },
  async run(payload) {
    return api.save(payload)
  },
})
```

If omitted, no `Start` event is generated.

---

### Event scoping

By default, lifecycle events are **scoped to the triggering entity**:

```
#entityId:fetchTodosSuccess
```

You can override this behavior:

```ts
handleAsync("bootstrap", handlers, { scope: "global" })
```

Available scopes:

- `"entity"` (default)
- `"type"`
- `"global"`

---

> **Key rule:** Async code must not access entities after `await`. All updates happen in event handlers.

---

## 🧩 Migrating from Redux Toolkit (RTK)

Inglorious Store now provides utilities to **gradually migrate from RTK slices and thunks**, leveraging `handleAsync` to simplify async logic.

### Converting Async Thunks

```javascript
import { convertAsyncThunk } from "@inglorious/store/rtk"

const fetchTodos = async (userId) => {
  const res = await fetch(`/api/users/${userId}/todos`)
  return res.json()
}

const todoHandlers = convertAsyncThunk("fetchTodos", fetchTodos, {
  onPending: (entity) => {
    entity.status = "loading"
  },
  onFulfilled: (entity, todos) => {
    entity.status = "success"
    entity.todos = todos
  },
  onRejected: (entity, error) => {
    entity.status = "error"
    entity.error = error.message
  },
})
```

```javascript
const todoList = {
  init(entity) {
    entity.todos = []
    entity.status = "idle"
  },
  ...todoHandlers,
}
```

### Converting Slices

```javascript
import { convertSlice } from "@inglorious/store/rtk"

const todoListType = convertSlice(todosSlice, {
  asyncThunks: {
    fetchTodos: {
      onPending: (entity) => {
        entity.status = "loading"
      },
      onFulfilled: (entity, todos) => {
        entity.items = todos
      },
      onRejected: (entity, error) => {
        entity.error = error.message
      },
    },
  },
})
```

- Reducers become event handlers automatically.
- Async thunks become `handleAsync` events.
- Initial state is applied via an `init` handler.
- Extra handlers can be added if needed.

---

### RTK-Style Dispatch Compatibility

```javascript
const dispatch = createRTKCompatDispatch(api, "todos")
dispatch({ type: "todos/addTodo", payload: "Buy milk" })
// becomes: api.notify('#todos:addTodo', 'Buy milk')
```

> Thunks are **not supported** in compat mode; convert them using `convertAsyncThunk`.

---

### Migration Guide

```javascript
import { createMigrationGuide } from "@inglorious/store/rtk"

const guide = createMigrationGuide(todosSlice)
console.log(guide)
```

Outputs a readable guide mapping RTK calls to Inglorious events.

---

### 🧪 Testing

Event handlers are pure functions (or can be treated as such), making them easy to test in isolation, much like Redux reducers. The `@inglorious/store/test` module provides utility functions to make this even simpler.

#### `trigger(entity, handler, payload, api?)`

The `trigger` function executes an event handler on a single entity and returns the new state and any events that were dispatched.

```javascript
import { trigger } from "@inglorious/store/test"

// Define your entity handler
function increment(entity, payload, api) {
  entity.value += payload.amount
  if (entity.value > 100) {
    api.notify("overflow", { id: entity.id })
  }
}

// Test it
const { entity, events } = trigger(
  { type: "counter", id: "counter1", value: 99 },
  increment,
  { amount: 5 },
)

expect(entity.value).toBe(104)
expect(events).toEqual([{ type: "overflow", payload: { id: "counter1" } }])
```

#### `createMockApi(entities)`

If your handler needs to interact with other entities via the `api`, you can create a mock API. This is useful for testing handlers that read from other parts of the state.

```javascript
import { createMockApi, trigger } from "@inglorious/store/test"

// Create a mock API with some initial entities
const api = createMockApi({
  counter1: { type: "counter", value: 10 },
  counter2: { type: "counter", value: 20 },
})

// A handler that copies a value from another entity
function copyValue(entity, payload, api) {
  const source = api.getEntity(payload.sourceId)
  entity.value = source.value
}

// Trigger the handler with the custom mock API
const { entity } = trigger(
  { type: "counter", id: "counter2", value: 20 },
  copyValue,
  { sourceId: "counter1" },
  api,
)

expect(entity.value).toBe(10)
```

The mock API provides:

- `getEntities()`: Returns all entities (frozen).
- `getEntity(id)`: Returns a specific entity by ID (frozen).
- `select(selector)`: Runs a selector against the entities.
- `dispatch(event)`: Records an event for later assertions.
- `notify(type, payload)`: A convenience wrapper around `dispatch`.
- `getEvents()`: Returns all events that were dispatched.

### 🌍 Systems for Global Logic

When you need to coordinate updates across multiple entities (not just respond to individual events), use systems. Systems run after all entity handlers for the same event, ensuring global consistency, and have write access to the entire state. This concept is the 'S' in the ECS Architecture (Entity-Component-System)!

```javascript
const systems = [
  {
    taskCompleted(state, taskId) {
      // Read from multiple todo lists
      const allTodos = Object.values(state)
        .filter((e) => e.type === "todoList")
        .flatMap((e) => e.todos)

      // Update global stats
      state.stats.total = allTodos.length
      state.stats.completed = allTodos.filter((t) => t.completed).length
    },
  },
]

const store = createStore({ types, entities, systems })
```

Systems receive the entire state and can modify any entity. They're useful for cross-cutting concerns, maintaining derived state, or coordinating complex state updates that can't be expressed as individual entity handlers.

### 🔗 Behavior Composition

A type can be a single behavior object, or an array of behaviors.

```javascript
// single-behavior type
const counter = {
  increment(entity) {
    entity.value++
  },

  decrement(entity) {
    entity.value--
  },
}

// multiple behavior type
const resettableCounter = [
  counter,
  {
    reset(entity) {
      entity.value = 0
    },
  },
]
```

A behavior is defined as either an object with event handlers, or a function that takes a type and returns an enhanced behavior (decorator pattern):

```javascript
// Base behavior
const resettable = {
  submit(entity, value) {
    entity.value = ""
  },
}

// Function that wraps and enhances a behavior
const validated = (type) => ({
  submit(entity, value, api) {
    if (!value.trim()) return
    type.submit?.(entity, value, api) // remember to always pass all args!
  },
})

// Another wrapper
const withLoading = (type) => ({
  submit(entity, value, api) {
    entity.loading = true
    type.submit?.(entity, value, api)
    entity.loading = false
  },
})

// Compose them together to form a type
const form = [resettable, validated, withLoading]
```

When multiple behaviors define the same event, they all run in order. This allows you to build middleware-like patterns: validation, logging, error handling, loading states, etc.

### ⏱️ Batched Mode

The Inglorious Store features an **event queue**. In the default `auto` update mode, each notified event will trigger and update of the state (same as Redux). But in `manual` update mode, you can process multiple events together before re-rendering:

```javascript
const store = createStore({ types, entities, updateMode: "manual" })

// add events to the event queue
store.notify("playerMoved", { x: 100, y: 50 })
store.notify("enemyAttacked", { damage: 10 })
store.notify("particleCreated", { type: "explosion" })

// process them all in batch
store.update()
```

Instead of re-rendering after each event, you can batch them and re-render once. This is what powers high-performance game engines and smooth animations.

---

## 🧮 Derived State with `compute`

Inglorious Store is fully compatible with Redux selectors, but it also provides a simpler, more explicit primitive for derived state: **`compute`**.

`compute` lets you derive values from the store state in a predictable and memoized way, without hidden reactivity or dependency graphs.

### Basic example

```js
import { compute } from "@inglorious/store"

const selectCounter = (state) => state.counter1.value
const selectMultiplier = (state) => state.settings.multiplier

const selectResult = compute(
  (count, multiplier) => count * multiplier,
  [selectCounter, selectMultiplier],
)
```

The returned function is a standard selector:

```js
const result = api.select(selectResult)
```

And it works seamlessly with `react-redux` or `@inglorious/react-store`:

```js
const value = useSelector(selectResult)
```

---

### How `compute` works

- Each **input selector** is called with the current state
- The results are compared using **strict equality (`===`)**
- If none of the inputs changed, the **previous result is reused**
- If at least one input changed, the result is recomputed

There is:

- ❌ no deep comparison
- ❌ no proxy-based reactivity
- ❌ no implicit dependency tracking

Memoization is **explicit and predictable**, based purely on the values returned by your selectors.

---

### Why `compute` instead of magic reactivity?

`compute` matches the core philosophy of Inglorious Store:

- derived state is just a function
- updates are explicit
- behavior is easy to reason about
- performance characteristics are obvious

If an input selector returns a new reference, the computation runs again.
If it doesn’t, it won’t.

No surprises.

---

### Zero or single input selectors

`compute` supports any number of inputs — including zero:

```js
const selectConstant = compute(() => 42)
```

Or just one:

```js
const selectDouble = compute(
  (count) => count * 2,
  [(entities) => entities.counter1.value],
)
```

---

### `createSelector` (Redux compatibility)

For migration and familiarity, Inglorious Store also exports `createSelector`, which is fully compatible with Redux:

```js
import { createSelector } from "@inglorious/store"

const selectResult = createSelector(
  [(state) => state.counter1.value],
  (count) => count * 2,
)
```

Internally, `createSelector` is just an alias for `compute`.

> **Note:** `compute` is the preferred API for new code.
> `createSelector` exists mainly for Redux compatibility and migration.

---

### When to use `compute`

Use `compute` when:

- you need derived or aggregated state
- you want memoization without magic
- you want selectors that are easy to test
- you want predictable recomputation rules

If you already know Redux selectors, you already know how to use `compute` — just with fewer rules and less ceremony.

---

## Comparison with Other State Libraries

| Feature                   | Redux        | RTK          | Zustand    | Jotai      | Pinia      | MobX       | Inglorious Store |
| ------------------------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ---------------- |
| **Boilerplate**           | 🔴 High      | 🟡 Medium    | 🟢 Low     | 🟢 Low     | 🟡 Medium  | 🟢 Low     | 🟢 Low           |
| **Multiple instances**    | 🔴 Manual    | 🔴 Manual    | 🔴 Manual  | 🔴 Manual  | 🟡 Medium  | 🟡 Medium  | 🟢 Built-in      |
| **Lifecycle events**      | 🔴 No        | 🔴 No        | 🔴 No      | 🔴 No      | 🔴 No      | 🔴 No      | 🟢 Yes           |
| **Async logic placement** | 🟡 Thunks    | 🟡 Complex   | 🟢 Free    | 🟢 Free    | 🟢 Free    | 🟢 Free    | 🟢 In handlers   |
| **Redux DevTools**        | 🟢 Yes       | 🟢 Yes       | 🟡 Partial | 🟡 Partial | 🟡 Partial | 🟢 Yes     | 🟢 Yes           |
| **Time-travel debugging** | 🟢 Yes       | 🟢 Yes       | 🔴 No      | 🔴 No      | 🔴 No      | 🟡 Limited | 🟢 Yes           |
| **Testability**           | 🟢 Excellent | 🟢 Excellent | 🟡 Good    | 🟡 Good    | 🟡 Good    | 🟡 Medium  | 🟢 Excellent     |
| **Immutability**          | 🔴 Manual    | 🟢 Immer     | 🔴 Manual  | 🔴 Manual  | 🔴 Manual  | 🔴 Manual  | 🟢 Mutative      |

---

## API Reference

### `createStore(options)`

```javascript
const store = createStore({
  types, // Object: entity type definitions
  entities, // Object: initial entities
  systems, // Array (optional): global state handlers
  autoCreateEntities, // Boolean (optional): false (default) or true
  updateMode, // String (optional): 'auto' (default) or 'manual'
})
```

**Returns:** A Redux-compatible store

**Options:**

- **`types`** (required) - Object defining entity type behaviors
- **`entities`** (required) - Object containing initial entity instances
- **`systems`** (optional) - Array of global state handlers
- **`autoCreateEntities`** (optional) - Automatically create singleton entities for types not defined in `entities`:
  - `false` (default) - Only use explicitly defined entities
  - `true` - Auto-create entities matching their type name
- **`updateMode`** (optional) - Controls when React components re-render:
  - `'auto'` (default) - Automatic updates after each event
  - `'manual'` - Manual control via `api.update()`

#### Auto-Create Entities

When `autoCreateEntities: true`, the store automatically creates singleton entities for any type that doesn't have a corresponding entity defined. This is particularly useful for singleton-type entities that behave like components, eliminating the need to switch between type definitions and entity declarations.

```javascript
const types = {
  settings: {
    setTheme(entity, theme) {
      entity.theme = theme
    },
  },
  analytics: {
    track(entity, event) {
      entity.events.push(event)
    },
  },
}

// Without autoCreateEntities (default)
const entities = {
  settings: { type: "settings", theme: "dark" },
  analytics: { type: "analytics", events: [] },
}

// With autoCreateEntities: true
const entities = {
  // settings and analytics will be auto-created as:
  // settings: { type: "settings" }
  // analytics: { type: "analytics" }
}

const store = createStore({
  types,
  entities,
  autoCreateEntities: true,
})

// Both approaches work the same way
store.notify("settings:setTheme", "light")
store.notify("analytics:track", { action: "click" })
```

**When to use `autoCreateEntities`:**

- ✅ Building web applications with singleton services (settings, auth, analytics)
- ✅ Component-like entities that only need one instance
- ✅ Rapid prototyping where you want to add types without ceremony
- ❌ Game development with multiple entity instances (players, enemies, items)
- ❌ When you need fine control over initial entity state

### Types Definition

```javascript
const types = {
  entityType: [
    // Behavior objects
    {
      eventName(entity, payload, api) {
        entity.value = payload
        api.notify("otherEvent", data)
      },
    },
    // Behavior functions (decorators)
    (behavior) => ({
      eventName(entity, payload, api) {
        // Wrap the behavior
        behavior.eventName?.(entity, payload, api)
      },
    }),
  ],
}
```

### Event Handler API

Each handler receives three arguments:

- **`entity`** - the entity instance (mutate freely, immutability guaranteed)
- **`payload`** - data passed with the event
- **`api`** - access to store methods:
  - `getEntities()` - entire state (read-only)
  - `getEntity(id)` - single entity (read-only)
  - `select(selector)` - run a selector against the state
  - `notify(type, payload)` - trigger other events
  - `dispatch(action)` - optional, if you prefer Redux-style dispatching
  - `getTypes()` - type definitions (for middleware)
  - `getType(typeName)` - type definition (for overriding)
  - `setType(typeName, type)` - change the behavior of a type

### Built-in Events

- **`create(entity)`** - triggered when entity added via `add` event, visible only to that entity
- **`destroy(entity)`** - triggered when entity removed via `remove` event, visible only to that entity

### Notify vs Dispatch

Both work (`dispatch` is provided just for Redux compatibility), but `notify` is cleaner (and uses `dispatch` internally):

```javascript
store.notify("eventName", payload)
store.dispatch({ type: "eventName", payload }) // Redux-compatible alternative
```

---

### 🧩 Type Safety

Inglorious Store is written in JavaScript but comes with powerful TypeScript support out of the box, allowing for a fully type-safe experience similar to Redux Toolkit, but with less boilerplate.

You can achieve strong type safety by defining an interface for your `types` configuration. This allows you to statically define the shape of your entity handlers, ensuring that all required handlers are present and correctly typed.

Here’s how you can set it up for a TodoMVC-style application:

**1. Define Your Types**

First, create an interface that describes your entire `types` configuration. This interface will enforce the structure of your event handlers.

```typescript
// src/store/types.ts
import type {
  FormEntity,
  ListEntity,
  FooterEntity,
  // ... other payload types
} from "../../types"

// Define the static shape of the types configuration
interface TodoListTypes {
  form: {
    inputChange: (entity: FormEntity, value: string) => void
    formSubmit: (entity: FormEntity) => void
  }
  list: {
    formSubmit: (entity: ListEntity, value: string) => void
    toggleClick: (entity: ListEntity, id: number) => void
    // ... other handlers
  }
  footer: {
    filterClick: (entity: FooterEntity, id: string) => void
  }
}

export const types: TodoListTypes = {
  form: {
    inputChange(entity, value) {
      entity.value = value
    },
    formSubmit(entity) {
      entity.value = ""
    },
  },
  // ... other type implementations
}
```

With `TodoListTypes`, TypeScript will throw an error if you forget a handler (e.g., `formSubmit`) or if its signature is incorrect.

**2. Create the Store**

When creating your store, you'll pass the `types` object. To satisfy the store's generic `TypesConfig`, you may need to use a double cast (`as unknown as`). This is a safe and intentional way to bridge your specific, statically-checked configuration with the store's more generic type.

```typescript
// src/store/index.ts
import { createStore, type TypesConfig } from "@inglorious/store"
import { types } from "./types"
import type { TodoListEntity, TodoListState } from "../../types"

export const store = createStore<TodoListEntity, TodoListState>({
  types: types as unknown as TypesConfig<TodoListEntity>,
  // ... other store config
})
```

**3. Enjoy Full Type Safety**

Now, your store is fully type-safe. The hooks provided by `@inglorious/react-store` will also be correctly typed.

---

## Use Cases

### Perfect For

- 🎮 Apps with multiple instances of the same entity type
- 🎯 Real-time collaborative features
- ⚡ Complex state coordination and async operations
- 📊 High-frequency updates (animations, games)
- 🔄 Undo/redo, time-travel debugging

### Still Great For

- Any Redux use case (true drop-in replacement)
- Migration path from Redux (keep using react-redux)

---

### Demos

Check out the following demos to see the Inglorious Store in action on real-case scenarios:

**React Examples:**

- **[React TodoMVC](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/react-todomvc)** - An (ugly) clone of Kent Dodds' [TodoMVC](https://todomvc.com/) experiments, showing the full compatibility with react-redux and The Redux DevTools.
- **[React TodoMVC-CS](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/react-todomvc-cs)** - A client-server version of the TodoMVC, which showcases the use of `notify` as a cleaner alternative to `dispatch` and async event handlers.
- **[React TodoMVC-RT](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/react-todomvc-rt)** - A "multiplayer" version, in which multiple clients are able to synchronize through a real-time server.
- **[React TodoMVC-TS](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/apps/react-todomvc-ts)** - A typesafe version of the base TodoMVC.

For more demos and examples with `@inglorious/web`, see the [`@inglorious/web` README](../web/README.md).

---

## Frequently Unsolicited Complaints (FUCs)

It's hard to accept the new, especially on Reddit. Here are the main objections to the Inglorious Store.

**"This is not ECS."**

It's not. The Inglorious Store is _inspired_ by ECS, but doesn't strictly follow ECS. Heck, not even the major game engines out there follow ECS by the book!

Let's compare the two:

| ECS Architecture                      | Inglorious Store                       |
| ------------------------------------- | -------------------------------------- |
| Entities are ids                      | Entities have an id                    |
| Components are pure, consecutive data | Entities are pure bags of related data |
| Data and behavior are separated       | Data and behavior are separated        |
| Systems operate on the whole state    | Systems operate on the whole state     |
| Usually written in an OOP environment | Written in an FP environment           |

**"This is not FP."**

It looks like it's not, and that's a feature. If you're used to classes and instances, the Inglorious Store will feel natural to you. Even behavior composition looks like inheritance, but it's actually function composition. The same [Three Principles](https://redux.js.org/understanding/thinking-in-redux/three-principles) that describe Redux are applied here (with some degree of freedom on function purity).

**"This is not Data-Oriented Design."**

It's not. Please grep this README and count how many occurrences of DoD you can find. This is not [Data-Oriented Design](https://en.wikipedia.org/wiki/Data-oriented_design), which is related to low-level CPU cache optimization. It's more similar to [Data-Driven Programming](https://en.wikipedia.org/wiki/Data-driven_programming), which is related to separating data and behavior. The Inglorious Store separates behavior in... behaviors (grouped into so-called types), while the data is stored in plain objects called entities.

---

## License

MIT © [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

Free to use, modify, and distribute.

---

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](../../CONTRIBUTING.md) first.
