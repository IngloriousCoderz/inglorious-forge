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

**Example:**

```typescript
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
