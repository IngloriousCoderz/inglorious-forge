---
title: API Reference
description: Detailed API documentation for Inglorious Store.
---

# API Reference

## `createStore(options)`

Creates a new Inglorious Store instance. Returns a Redux-compatible store.

```javascript
const store = createStore({
  types, // Object: entity type definitions (required)
  entities, // Object: initial entities (required)
  systems, // Array: global state handlers (optional)
  autoCreateEntities, // Boolean: auto-create singleton entities (optional)
  updateMode, // String: 'auto' | 'manual' (optional)
})
```

### Options

#### `types` (required)

Object defining entity type behaviors. Each type is a behavior object or array of behaviors:

```javascript
const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, done: false })
    },
    removeTodo(entity, id) {
      entity.todos = entity.todos.filter((t) => t.id !== id)
    },
  },
  counter: {
    increment(entity) {
      entity.value++
    },
  },
}
```

#### `entities` (required)

Object containing initial entity instances:

```javascript
const entities = {
  workTodos: { type: "todoList", todos: [] },
  personalTodos: { type: "todoList", todos: [] },
  counter: { type: "counter", value: 0 },
}
```

#### `systems` (optional)

Array of global state handlers that run after all entity handlers:

```javascript
const systems = [
  {
    taskCompleted(state, prevState) {
      // Calculate derived state, validate consistency, etc.
      console.log("All handlers finished, state updated")
    },
  },
]

const store = createStore({ types, entities, systems })
```

#### `autoCreateEntities` (optional)

Boolean flag to automatically create singleton entities for types not defined in `entities`:

```javascript
const store = createStore({
  types: {
    settings: {
      setTheme(e, t) {
        e.theme = t
      },
    },
    analytics: {
      track(e, ev) {
        e.events.push(ev)
      },
    },
  },
  entities: {},
  autoCreateEntities: true,
})

// Automatically creates:
// settings: { type: "settings" }
// analytics: { type: "analytics" }
```

**Use when:**

- ✅ Building web apps with singleton services
- ❌ Managing multiple instances (game development)
- ❌ When you need fine-grained initial state

#### `updateMode` (optional)

Controls when the store notifies subscribers:

- **`'auto'`** (default) - Subscribers notified after each event
- **`'manual'`** - Call `api.update()` to batch updates

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual",
})

// Multiple events, single update
store.notify("playerMoved", { x: 100, y: 50 })
store.notify("enemyAttacked", { damage: 10 })
store.update() // Subscribers notified once
```

## Store Methods

### `notify(eventType, payload)`

Trigger an event. All entities with a handler for that event will process it.

```javascript
// Broadcast to all entities
store.notify("taskCompleted", "task123")

// Targeted notifications
store.notify("#entityId:eventName", payload) // Specific entity
store.notify("typeName:eventName", payload) // Specific type
store.notify("type#id:eventName", payload) // Type + entity
```

### `dispatch(action)`

Redux-compatible dispatch. Use `notify()` instead (cleaner):

```javascript
store.dispatch({ type: "eventName", payload })
// Same as: store.notify("eventName", payload)
```

### `subscribe(listener)`

Redux-compatible subscription:

```javascript
const unsubscribe = store.subscribe(() => {
  console.log("State changed!", store.getState())
})

// Later:
unsubscribe()
```

### `getState()`

Get the current state object:

```javascript
const state = store.getState()
console.log(state.workTodos.todos)
```

### `update()`

For `manual` update mode only. Process queued events and notify subscribers:

```javascript
const store = createStore({ types, entities, updateMode: "manual" })

store.notify("event1", payload1)
store.notify("event2", payload2)
store.update() // Subscribers notified once
```

### `replaceReducer(nextReducer)`

Redux-compatible method. Not typically used with Inglorious Store. For advanced use cases only.

## Event Handler API

Event handlers receive three arguments:

```javascript
const types = {
  todoList: {
    // Handler with all three arguments
    addTodo(entity, payload, api) {
      // entity: the entity being updated (mutate freely)
      // payload: data passed to notify()
      // api: store methods
    },

    // Handlers can omit unused arguments
    refresh(entity) {
      entity.lastRefresh = Date.now()
    },
  },
}
```

### Handler Arguments

#### `entity`

The entity instance. Mutate freely — immutability is guaranteed:

```javascript
toggle(entity, id) {
  const item = entity.items.find((i) => i.id === id)
  if (item) item.done = !item.done // Looks like mutation, is immutable
}
```

#### `payload`

The data passed with the event:

```javascript
store.notify("addTodo", "Buy milk")
// Handler receives "Buy milk" as payload

addTodo(entity, payload) {
  entity.todos.push({ text: payload, done: false })
}
```

#### `api`

Access to store operations:

```javascript
async fetchData(entity, userId, api) {
  entity.loading = true

  const data = await fetch(`/api/${userId}`).then((r) => r.json())

  // Trigger another event
  api.notify("dataLoaded", data)

  // Read other entities
  const user = api.getEntity("user")
  const allEntities = api.getEntities()

  // Access type definitions (advanced)
  const typeDef = api.getType("todoList")
  const allTypes = api.getTypes()

  // Change type behavior at runtime (advanced)
  api.setType("counter", { /* new behavior */ })

  // Manual batch control (if updateMode: "manual")
  api.update()
}
```

### API Methods

#### `api.getEntities()`

Returns the entire current state (read-only):

```javascript
const allEntities = api.getEntities()
const workTodos = allEntities.workTodos
```

#### `api.getEntity(id)`

Get a specific entity (read-only):

```javascript
const user = api.getEntity("user")
const userId = user.id
```

#### `api.select(selector)`

Run a selector against the current state:

```javascript
const activeFilter = (state) => state.toolbar.activeFilter
const filter = api.select(activeFilter)
```

#### `api.notify(eventType, payload)`

Trigger another event (queued with current event):

```javascript
async login(entity, credentials, api) {
  const user = await authenticateUser(credentials)
  api.notify("loginSuccess", user)
  api.notify("analytics:logLogin", user)
}

loginSuccess(entity, user) {
  entity.user = user
  entity.loggedIn = true
}
```

#### `api.dispatch(action)`

Redux-style dispatch (less common, use `notify` instead):

```javascript
api.dispatch({ type: "customEvent", payload })
```

#### `api.getTypes()`

Get all type definitions (read-only):

```javascript
const types = api.getTypes()
const todoListType = types.todoList
```

#### `api.getType(typeName)`

Get a specific type definition:

```javascript
const type = api.getType("todoList")
```

#### `api.setType(typeName, newType)`

Change a type's behavior at runtime (advanced):

```javascript
store.notify("upgradeType", {
  typeName: "counter",
  behavior: { increment: () => {}, doubleIncrement: () => {} }
})

upgradeType(entity, { typeName, behavior }, api) {
  api.setType(typeName, behavior)
}
```

#### `api.update()`

For `manual` update mode: process events and notify subscribers:

```javascript
// This only exists/works if updateMode: "manual"
api.update()
```

## Built-in Events

### `create`

Triggered when an entity is added via the `add` event. **Visible only to the created entity** (not broadcast):

```javascript
const types = {
  todoList: {
    create(entity) {
      // Initialize new list
      entity.createdAt = Date.now()
      entity.todos = entity.todos || []
    },
  },
}

store.notify("add", { id: "work", type: "todoList", todos: [] })
// create handler fires only for "work" entity
```

### `destroy`

Triggered when an entity is removed via the `remove` event. **Visible only to the destroyed entity** (not broadcast):

```javascript
const types = {
  file: {
    destroy(entity, payload, api) {
      // Cleanup
      console.log(`Destroying file: ${entity.id}`)
      // Save to database, close connections, etc.
    },
  },
}

store.notify("remove", { id: "tempFile" })
// destroy handler fires only for "tempFile" entity
```

### `add`

Built-in event to add a new entity:

```javascript
store.notify("add", {
  id: "newList",
  type: "todoList",
  todos: [],
  priority: "high",
})

// Triggers: create event for newList
// Result: newList entity appears in state
```

### `remove`

Built-in event to remove an entity:

```javascript
store.notify("remove", { id: "workTodos" })

// Triggers: destroy event for workTodos
// Result: workTodos entity removed from state
```

## `handleAsync(eventName, handlers, options?)`

Helper to generate lifecycle events for async operations:

```typescript
import { handleAsync } from "@inglorious/store"

const types = {
  todoList: {
    ...handleAsync("fetchTodos", {
      async run(entity, userId, api) {
        const todos = await fetch(`/api/users/${userId}/todos`).then((r) =>
          r.json(),
        )
        api.notify("success", todos)
      },
      start(entity) {
        entity.loading = true
      },
      success(entity, todos) {
        entity.todos = todos
        entity.loading = false
      },
      error(entity, error) {
        entity.error = error
        entity.loading = false
      },
    }),
  },
}

store.notify("fetchTodos", userId)
```

Generated events:

- `fetchTodos` - Trigger the async operation
- `fetchTodosRun` - The async function runs
- `fetchTodosSuccess` - Success handler fires
- `fetchTodosError` - Error handler fires
- `fetchTodosFinally` - Always fires (optional)

### Options

```typescript
handleAsync(
  "fetchTodos",
  {
    /* handlers */
  },
  {
    scope: "entity", // "entity" | "type" | "global"
    // "entity": #entityId:fetchTodosSuccess
    // "type": todoList:fetchTodosSuccess
    // "global": fetchTodosSuccess
  },
)
```

## `compute(fn, selectors)`

Create memoized derived state:

```javascript
import { compute } from "@inglorious/store"

const selectTotal = compute(
  (work, personal) => work.length + personal.length,
  [(state) => state.workTodos.todos, (state) => state.personalTodos.todos],
)

// Works with selectors
const total = useSelector(selectTotal)
```

## `createSelector(inputSelectors, resultFn)`

Redux-compatible selector (alias for `compute`):

```javascript
import { createSelector } from "@inglorious/store"

const selectTotalTodos = createSelector(
  [(state) => state.workTodos.todos, (state) => state.personalTodos.todos],
  (work, personal) => work.length + personal.length,
)

const total = useSelector(selectTotalTodos)
```

## Notify vs Dispatch

Both work, but `notify()` is the preferred API:

```javascript
// Preferred: cleaner and more explicit
store.notify("addTodo", text)

// Still works: Redux-compatible
store.dispatch({ type: "addTodo", payload: text })
```

## React Integration

Inglorious Store works with `react-redux`:

```javascript
import { Provider, useSelector, useDispatch } from "react-redux"
import { createStore } from "@inglorious/store"

const store = createStore({ types, entities })

function App() {
  return (
    <Provider store={store}>
      <TodoList />
    </Provider>
  )
}

function TodoList() {
  const todos = useSelector((state) => state.workTodos.todos)
  const dispatch = useDispatch()

  return (
    <button onClick={() => dispatch({ type: "addTodo", payload: "..." })}>
      Add
    </button>
  )
}
```

For a better React experience, use `@inglorious/react-store`:

```javascript
import { createReactStore } from "@inglorious/react-store"

const { Provider, useSelector, useNotify } = createReactStore(store)

function TodoList() {
  const todos = useSelector((state) => state.workTodos.todos)
  const notify = useNotify()

  return <button onClick={() => notify("addTodo", "...")}>Add</button>
}
```

## Type Safety (TypeScript)

Define types for your store:

```typescript
import type { TypesConfig } from "@inglorious/store"

interface TodoListEntity {
  type: "todoList"
  todos: Array<{ id: number; text: string; done: boolean }>
}

interface TodoListState {
  workTodos: TodoListEntity
  personalTodos: TodoListEntity
}

interface TodoListTypes extends TypesConfig<TodoListEntity> {
  todoList: {
    addTodo(entity: TodoListEntity, text: string): void
    toggle(entity: TodoListEntity, id: number): void
  }
}

const types: TodoListTypes = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, done: false })
    },
    toggle(entity, id) {
      const todo = entity.todos.find((t) => t.id === id)
      if (todo) todo.done = !todo.done
    },
  },
}

const store = createStore<TodoListEntity, TodoListState>({
  types: types as unknown as TypesConfig<TodoListEntity>,
  entities,
})
```

## RTK Migration Utilities

Inglorious Store provides utilities to help migrate from Redux Toolkit:

### `convertAsyncThunk(eventName, asyncFn, options?)`

```typescript
import { convertAsyncThunk } from "@inglorious/store/rtk"

const handlers = convertAsyncThunk("fetchTodos", fetchTodosAsync, {
  onPending: (entity) => (entity.loading = true),
  onError: (entity, error) => (entity.error = error),
  onSuccess: (entity, data) => (entity.todos = data),
})

const types = {
  todoList: { ...handlers },
}
```

### `convertSlice(slice, options?)`

```typescript
import { convertSlice } from "@inglorious/store/rtk"

const todoListType = convertSlice(todosSlice, {
  asyncThunks: {
    fetchTodos: fetchTodosAsync,
  },
})

const types = {
  todoList: todoListType,
}
```

### `createRTKCompatDispatch(api, entityId)`

```typescript
import { createRTKCompatDispatch } from "@inglorious/store/rtk"

const dispatch = createRTKCompatDispatch(api, "todos")
dispatch({ type: "todos/addTodo", payload: "Buy milk" })
```

For more details, see [Migrating from Redux & RTK](/advanced/migration).
