# @inglorious/store - Complete Reference

## Installation

```bash
npm install @inglorious/store
```

## Core Concepts

A Redux-compatible, ECS-inspired state library that eliminates boilerplate while keeping state transitions explicit and predictable.

**Redux Compatibility:**

- ✅ Compatible with `react-redux` Provider/useSelector/useDispatch
- ✅ Compatible with Redux DevTools
- ✅ Compatible with Redux-style `dispatch({ type, payload })`
- ⚠️ Redux middlewares (Redux-Saga, Redux-Thunk) may require adaptation
- ⚠️ Prefer `api.notify()` for event-driven updates (cleaner API)

## Basic Setup

```javascript
import { createStore } from "@inglorious/store"

const types = {
  counter: {
    increment(entity) {
      entity.value++
    },
  },
}

const entities = {
  counter1: { type: "counter", value: 0 },
}

const store = createStore({ types, entities })
```

## Event Handlers

Handlers are called with: `entity`, `payload`, `api` (you can omit unused parameters).

```javascript
const types = {
  tasks: {
    addTask(entity, text, api) {
      entity.items.push({ id: Date.now(), text })
      api.notify("taskAdded", { count: entity.items.length })
    },
  },
}
```

## Lifecycle Events

```javascript
const types = {
  logger: {
    create(entity) {
      entity.startTime = Date.now()
    },
    destroy(entity) {
      entity.endTime = Date.now()
    },
  },
}
```

## Event Targeting

```javascript
store.notify("event") // All entities with handler
store.notify("type:event") // Only entities of type
store.notify("#id:event") // Only entity with id
store.notify("type#id:event") // Specific type and id
```

## Dynamic Entities

```javascript
store.notify("add", { id: "counter4", type: "counter", value: 0 })
store.notify("remove", "counter4")
```

## Async Operations

```javascript
const types = {
  todos: {
    async itemsLoad(entity, _, api) {
      entity.loading = true
      const response = await fetch("/api/todos")
      const data = await response.json()
      api.notify("itemsLoadSuccess", data)
    },
    itemsLoadSuccess(entity, items) {
      entity.items = items
      entity.loading = false
    },
  },
}
```

### handleAsync Helper

```javascript
import { handleAsync } from "@inglorious/store"

const types = {
  todos: {
    ...handleAsync("fetchTodos", {
      start(entity) {
        entity.loading = true
      },
      async run(payload, api) {
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
    }),
  },
}
```

**Lifecycle events generated:**

- `fetchTodos` → triggers the operation
- `fetchTodosStart` → (if `start` handler provided)
- `fetchTodosRun` → executes async operation
- `fetchTodosSuccess` → on success
- `fetchTodosError` → on error
- `fetchTodosFinally` → always

**Important notes:**

- Use `...handleAsync(...)` to spread handlers into the type
- `run` receives `(payload, api)` — **not** `entity`
- All handlers receive `api` as the last parameter
- `start` is optional

## Systems

Global logic that runs after all entity handlers for the same event:

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

## Behavior Composition

```javascript
const incrementable = {
  increment(entity) {
    entity.value++
  },
}

const resettable = {
  reset(entity) {
    entity.value = 0
  },
}

const types = {
  counter: [incrementable, resettable],
}
```

### Decorator Pattern

```javascript
const withValidation = (type) => ({
  ...type,
  submit(entity, value, api) {
    if (!value.trim()) return
    type.submit?.(entity, value, api)
  },
})

const types = {
  form: [withValidation],
}
```

## Batched Mode

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual",
})

store.notify("playerMoved", { x: 100, y: 50 })
store.notify("enemyAttacked", { damage: 10 })
store.update() // Process batch
```

## Derived State

**Using `compute` (memoized selectors):**

```javascript
import { compute } from "@inglorious/store"

const value = (state) => state.counter1.value
const multiplier = (state) => state.settings.multiplier

const result = compute((count, mult) => count * mult, [value, multiplier])

// Later:
const total = result(store.getState())
```

**Using `api.select()` (direct selectors):**

```javascript
const value = (state) => state.counter1.value
const multiplier = (state) => state.settings.multiplier

const types = {
  stats: {
    recalc(entity, _, api) {
      const count = api.select(value)
      const mult = api.select(multiplier)
      entity.result = count * mult
    },
  },
}
```

## API Reference

### `createStore(options)`

```javascript
const store = createStore({
  types, // Entity behaviors
  entities, // Initial entities
  systems, // Optional: global handlers
  autoCreateEntities, // Optional: boolean (default false)
  updateMode, // Optional: 'auto' | 'manual'
  middlewares, // Optional: middleware array
})
```

### Handler API (`api` parameter)

- `getEntities()` - Read all state (read-only)
- `getEntity(id)` - Read entity (read-only)
- `select(selector)` - Run selector against current state
- `notify(type, payload)` - Trigger events (preferred over dispatch)
- `dispatch(action)` - Redux-style dispatch (for compatibility)
- `getTypes()` - Access type definitions
- `getType(name)` - Access specific type
- `setType(name, type)` - Modify type

**Rules:**

- Mutations inside handlers are safe (store uses Mutative)
- `api.getEntity()` and `api.getEntities()` return read-only snapshots
- Events triggered via `api.notify()` are queued and processed in order

### Built-in Events

- `add` - Add entity (triggers `create`)
- `remove` - Remove entity (triggers `destroy`)

## Testing

```javascript
import { trigger, createMockApi } from "@inglorious/store/test"

// Test handlers
const { entity, events } = trigger(
  { type: "counter", id: "counter1", value: 99 },
  increment,
  { amount: 5 },
)
expect(entity.value).toBe(104)

// With mock API
const api = createMockApi({
  counter1: { type: "counter", value: 10 },
})
const { entity: copied } = trigger(
  { id: "counter2", type: "counter", value: 20 },
  copyValue,
  { sourceId: "counter1" },
  api,
)
```

## TypeScript

```typescript
interface TodoListTypes {
  form: {
    inputChange: (entity: FormEntity, value: string) => void
    formSubmit: (entity: FormEntity) => void
  }
}

export const types: TodoListTypes = {
  form: {
    inputChange(entity, value) {
      /* ... */
    },
    formSubmit(entity) {
      /* ... */
    },
  },
}

const store = createStore<TodoListEntity, TodoListState>({
  types: types as unknown as TypesConfig<TodoListEntity>,
  entities,
})
```

## Common Pitfalls

### ❌ Wrong: Direct mutation outside handler

```javascript
const entity = store.getState().counter1
entity.value++ // Wrong - no event
```

### ✅ Correct: Use notify() or dispatch()

```javascript
store.notify("#counter1:increment")
store.dispatch({ type: "increment", payload: null })
```

### ❌ Wrong: Mutating read-only entity from api.getEntity()

```javascript
const types = {
  counter: {
    increment(entity, _, api) {
      const other = api.getEntity("counter2")
      other.value++ // Wrong - read-only
    },
  },
}
```

### ✅ Correct: Notify event to target entity

```javascript
const types = {
  counter: {
    increment(entity, _, api) {
      api.notify("#counter2:increment")
    },
  },
}
```
