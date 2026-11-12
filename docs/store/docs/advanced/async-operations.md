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
        api.notify("todosLoaded", data)
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

::: warning Drafts end at the first `await`
`entity`, and every object or array read from it, is a draft that lives only until the update ends. The update does not wait for your `await`, so after it the draft is revoked: writing to `entity` throws, and so does reading anything taken from it, even in a payload you notify later. Write to `entity` only before the first `await`, and after it notify an event that does the writing, as `todosLoaded` does above. Take plain values for later before the first `await`:

```javascript
async save(entity, payload, api) {
  const ids = entity.items.map((item) => item.id) // numbers: safe after await
  const items = entity.items.filter((item) => item.isDone) // drafts: not safe
  await fetch("/api/items", { method: "POST", body: JSON.stringify(ids) })
  api.notify("saved", ids)
}
```

:::

## `handleRequest`

Most async work is a request whose progress the entity shows: loading, then the result or what went wrong. `handleRequest` keeps that state for you, and it's the helper to reach for first:

```javascript
import { handleRequest } from "@inglorious/store/async"

export const types = {
  todoList: {
    ...handleRequest("loadTodos", {
      run: (name) => fetch(`/api/todos/${name}`).then((r) => r.json()),
      success(entity, todos) {
        entity.todos = todos
      },
    }),
  },
}
```

This is the example above without its bookkeeping:

- **Status**: `entity.status` is `"loading"` from the start, then `"success"` or `"error"`. Give it a first value, such as `"idle"`, in `create`.
- **Error**: `entity.error` is cleared when a call starts and set when it fails, to the error's message. `toError` turns it into what the screen needs, such as a translation key. The `error` handler receives that value once it is set, and can change what the entity shows, such as moving to another step for an error it expects.
- **Only the latest call counts**: the answer of a call that a newer one replaced is dropped, success and failure alike, so a slow search never overwrites a quicker, later one. With `isLatestOnly: false` every call counts, as when saving several items at once.
- **Several requests on one entity**: `status` and `error` options name their fields, such as `{ status: "saveStatus", error: "saveError" }`.
- **Scope**: `scope` routes the lifecycle events as in `handleAsync`, below.

To wait until someone stops typing, debounce the event that starts the request with `withDebounce` from `@inglorious/web`, as in `[JobList, withDebounce(300, ["search"])]`. Debouncing starts fewer calls, and dropping outdated answers covers those that still overlap.

## `handleAsync`

`handleAsync` is the lower level that `handleRequest` is built on: the same lifecycle events, with no status or error kept and every call's answer let through. Use it for async work the entity doesn't show, such as saving a preference in the background, a call whose failure is only logged, or a check that must keep its last answer when it fails.

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

Each call gets a `callId`, and every event of that call carries it: `Start` and `Run` get `{ payload, callId }`, `Success` gets `{ result, callId }`, `Error` gets `{ error, callId }` and `Finally` gets `{ callId }`. The `start`, `run`, `success`, `error` and `finally` handlers still receive the payload, result or error alone; the `callId` matters to code that listens to the events directly, such as `optimistic`.

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

Each call keeps its own snapshot, so saves on the same entity can overlap. A failed call restores the keys it patched, except those a later pending call patched too: those go back to what they were before both once that call fails as well, or stay as that call left them.

A patch built on the current value, such as a list with a temporary item added, cannot be undone key by key when two calls change the same list. Give `rollback` to undo the call's own change in place of restoring the snapshot:

```typescript
const addTodo = optimistic(
  handleAsync("addTodo", {
    async run(todo) {
      return api.add(todo)
    },
  }),
  (entity, todo) => ({ todos: [...entity.todos, { ...todo, pending: true }] }),
  {
    rollback(entity, todo) {
      entity.todos = entity.todos.filter(({ id }) => id !== todo.id)
    },
  },
)
```

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
