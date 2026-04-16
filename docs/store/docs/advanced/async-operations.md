---
title: Async Operations
description: Learn how to handle async logic in Inglorious Store.
---

# Async Operations

In **Inglorious Store**, your event handlers can be async, and you get deterministic behavior automatically. Inside an async handler, you can access other parts of state (read-only), and you can trigger other events via `api.notify()`.

```javascript
export const types = {
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
- **`api.getEntities(typeName)`** - read entities by type
- **`api.getEntity(id)`** - read one entity
- **`api.notify(type, payload)`** - trigger other events (queued, not immediate)
- **`api.dispatch(action)`** - optional, if you prefer Redux-style dispatching
- **`api.getTypes()`** - access type definitions (mainly for middleware/plugins)
- **`api.getType(typeName)`** - access type definition (mainly for overrides)

All events triggered via `api.notify()` enter the queue and process together, maintaining predictability and testability.

## `handleAsync`

The `handleAsync` helper generates a set of event handlers representing the lifecycle of an async operation.

```typescript
handleAsync(type, handlers, options?)
```

Think of the flow like a newspaper article:

- `start` writes the headline and sets the scene
- `run` gathers the reporting
- `success` publishes the story
- `error` prints the correction
- `finally` archives the notes

**Example:**

```typescript
import { handleAsync } from "@inglorious/store/async"

const todoList = {
  ...handleAsync("fetchTodos", {
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
  }),
}
```

Triggering `fetchTodos` emits the following events:

```
fetchTodos
fetchTodosRun
fetchTodosSuccess | fetchTodosError
fetchTodosFinally
```

Each step is an **event handler**, not an implicit callback.

### Optional `start` handler

Use `start` for synchronous setup (loading flags, resets, optimistic state):

```typescript
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

### Optimistic Updates

If you want optimistic UI state, wrap the async behavior with `optimistic`.
This helper lives at `@inglorious/store/optimistic`, so only users who need it import it:

```typescript
import { handleAsync } from "@inglorious/store/async"
import { optimistic } from "@inglorious/store/optimistic"

const saveTodo = optimistic(
  handleAsync("saveTodo", {
    async run(payload) {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    success(entity, todo) {
      entity.todos = entity.todos.map((item) =>
        item.id === todo.tempId ? todo : item,
      )
    },
  }),
  (entity, payload) => ({
    todos: [
      ...entity.todos,
      {
        id: payload.tempId,
        title: payload.title,
        completed: payload.completed,
        pending: true,
      },
    ],
  }),
)
```

If the optimistic state does not depend on the payload, use a static patch instead:

```typescript
const saveSettings = optimistic(
  handleAsync("saveSettings", {
    async run(payload) {
      return api.save(payload)
    },
  }),
  { status: "saving" },
)
```

The wrapper stores a shallow snapshot of the patched keys, applies the optimistic patch during `Start`, and restores the previous values if the request fails.

### Event scoping

By default, lifecycle events are **scoped to the triggering entity**:

```
#entityId:fetchTodosSuccess
```

You can override this behavior:

```typescript
handleAsync("bootstrap", handlers, { scope: "global" })
```

Available scopes:

- `"entity"` (default)
- `"type"`
- `"global"`

> **Key rule:** Async code must not access entities after `await`. All updates happen in event handlers.
