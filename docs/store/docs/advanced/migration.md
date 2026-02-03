---
title: Migrating from Redux & RTK
description: Guide to migrating from Redux and Redux Toolkit to Inglorious Store.
---

# Migrating from Redux & RTK

Inglorious Store is a **drop-in replacement for Redux**, making migration straightforward. You can gradually adopt Inglorious Store while keeping your existing `react-redux` setup intact.

## Why Migrate?

**Redux/RTK drawbacks:**

- Verbose boilerplate (action creators, reducers, slices)
- Complex async logic (thunks, createAsyncThunk)
- Manual reshaping of state for multiple instances
- Difficult to manage lifecycle events (create/destroy)

**Inglorious Store benefits:**

- No action creators or reducers
- Async handlers integrated natively
- Built-in entity management
- Lifecycle events (create/destroy) out of the box
- Same Redux DevTools support

## Step 1: Drop-in Replacement

The simplest migration: **replace your Redux store** with Inglorious Store while keeping your components unchanged.

### Before (Redux)

```javascript
// store.js
import { configureStore } from "@reduxjs/toolkit"
import todosReducer from "./todosSlice"

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
})
```

### After (Inglorious Store)

```javascript
// store.js
import { createStore } from "@inglorious/store"

const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, done: false })
    },
    toggleTodo(entity, id) {
      const todo = entity.todos.find((t) => t.id === id)
      if (todo) todo.done = !todo.done
    },
  },
}

const entities = {
  todos: { type: "todoList", todos: [] },
}

export const store = createStore({ types, entities })
```

**Your React components stay the same:**

```javascript
// components/TodoList.jsx
import { useSelector, useDispatch } from "react-redux"

export function TodoList() {
  const todos = useSelector((state) => state.todos.todos)
  const dispatch = useDispatch()

  return (
    <div>
      {todos.map((todo) => (
        <input
          key={todo.id}
          type="checkbox"
          checked={todo.done}
          onChange={() => dispatch({ type: "toggleTodo", payload: todo.id })}
        />
      ))}
    </div>
  )
}
```

No component changes needed!

## Step 2: Switch to `notify()` API

Once you're comfortable, replace `dispatch` with `notify()` for a cleaner API:

### Before (dispatch)

```javascript
dispatch({ type: "addTodo", payload: "Buy groceries" })
dispatch({ type: "toggleTodo", payload: 123 })
```

### After (notify)

```javascript
store.notify("addTodo", "Buy groceries")
store.notify("toggleTodo", 123)
```

**Or in React components, use `@inglorious/react-store`:**

```javascript
import { useNotify } from "@inglorious/react-store"

export function TodoList() {
  const notify = useNotify()

  return <button onClick={() => notify("addTodo", "New task")}>Add Task</button>
}
```

Much cleaner!

## Step 3: Convert Async Thunks

### Before (Redux Thunk)

```javascript
const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/todos`)
      return response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const todosSlice = createSlice({
  name: "todos",
  initialState: { data: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})
```

### After (Inglorious Store)

```javascript
const types = {
  todoList: {
    async fetchTodos(entity, userId, api) {
      try {
        entity.loading = true
        entity.error = null

        const response = await fetch(`/api/users/${userId}/todos`)
        const data = await response.json()

        api.notify("fetchTodosSuccess", data)
      } catch (error) {
        api.notify("fetchTodosError", error.message)
      }
    },

    fetchTodosSuccess(entity, data) {
      entity.loading = false
      entity.data = data
    },

    fetchTodosError(entity, error) {
      entity.loading = false
      entity.error = error
    },
  },
}
```

**Usage in components stays the same:**

```javascript
const notify = useNotify()
notify("fetchTodos", userId)
```

## Step 4: Manage Multiple Instances

Redux requires manual state reshaping for multiple instances. Inglorious Store handles it automatically.

### Before (Redux - Manual)

```javascript
const store = configureStore({
  reducer: {
    workTodos: todosReducer,
    personalTodos: todosReducer,
  },
})

// To add a new list at runtime:
// You need to create new slices or use a complex reducer pattern
```

### After (Inglorious Store - Automatic)

```javascript
const entities = {
  workTodos: { type: "todoList", todos: [] },
  personalTodos: { type: "todoList", todos: [] },
}

// To add a new list at runtime:
store.notify("add", {
  id: "projectTodos",
  type: "todoList",
  todos: [],
})
```

**In components:**

```javascript
const workTodos = useSelector((state) => state.workTodos.todos)
const personalTodos = useSelector((state) => state.personalTodos.todos)
const projectTodos = useSelector((state) => state.projectTodos?.todos || [])
```

## Step 5: Leverage Lifecycle Events

Inglorious Store has built-in lifecycle events (`create`, `destroy`) that Redux lacks.

```javascript
const types = {
  todoList: {
    create(entity) {
      // Initialize when entity is added
      console.log(`Created todo list: ${entity.id}`)
    },

    destroy(entity) {
      // Cleanup when entity is removed
      console.log(`Destroyed todo list: ${entity.id}`)
    },

    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, done: false })
    },
  },
}

// These handlers fire automatically
store.notify("add", { id: "myList", type: "todoList", todos: [] })
store.notify("remove", { id: "myList" }) // destroy handler fires
```

## Step 6: Embrace the `api` Object

The `api` parameter in handlers gives you access to the entire state and event system:

```javascript
const types = {
  todoList: {
    async loadUserTodos(entity, userId, api) {
      // Read from other entities
      const user = api.getEntity("user")
      const allEntities = api.getEntities()

      // Make API call
      const todos = await fetch(`/api/users/${userId}/todos`).then((r) =>
        r.json(),
      )

      // Trigger other events (queued, not immediate)
      api.notify("todosLoaded", todos)
      api.notify("analytics:trackEvent", { action: "loadedTodos" })
    },

    todosLoaded(entity, todos) {
      entity.todos = todos
      entity.loading = false
    },
  },
}
```

## Conversion Utilities

Inglorious Store provides helpers to automate migration from RTK:

### `convertAsyncThunk()`

Convert Redux async thunks to Inglorious handlers:

```javascript
import { convertAsyncThunk } from "@inglorious/store/rtk"

const fetchTodos = async (userId) => {
  const res = await fetch(`/api/users/${userId}/todos`)
  return res.json()
}

const handlers = convertAsyncThunk("fetchTodos", fetchTodos, {
  onPending: (entity) => (entity.loading = true),
  onError: (entity, error) => (entity.error = error),
})

const types = {
  todoList: {
    ...handlers,
  },
}
```

### `convertSlice()`

Convert Redux Toolkit slices to Inglorious types:

```javascript
import { convertSlice } from "@inglorious/store/rtk"

const todoListType = convertSlice(todosSlice, {
  asyncThunks: {
    fetchTodos: async (userId) =>
      (await fetch(`/api/users/${userId}/todos`)).json(),
  },
})

const types = {
  todoList: todoListType,
}
```

### `createRTKCompatDispatch()`

For gradual migration, use Redux-style dispatch:

```javascript
import { createRTKCompatDispatch } from "@inglorious/store/rtk"

const api = store.api // from context or plugin
const dispatch = createRTKCompatDispatch(api, "todos")

// Still works with Redux-style dispatch
dispatch({ type: "todos/addTodo", payload: "Buy milk" })
// becomes: api.notify("#todos:addTodo", "Buy milk")
```

## Migration Checklist

- [ ] Replace `configureStore()` with `createStore()`
- [ ] Convert reducers to event handlers in types
- [ ] Migrate action creators to handler event names
- [ ] Convert async thunks to async handlers
- [ ] Update entity selectors (same as before, usually)
- [ ] Switch `dispatch()` to `notify()` in new code
- [ ] Test with Redux DevTools (should work unchanged)
- [ ] Remove Redux Toolkit dependencies

## Common Patterns

### Local Loading State

**Redux:**

```javascript
const todosSlice = createSlice({
  name: "todos",
  initialState: { data: [], loading: false },
  // ... reducer logic
})
```

**Inglorious:**

```javascript
const types = {
  todoList: {
    async fetchTodos(entity, id, api) {
      entity.loading = true
      const data = await fetchApi(id)
      api.notify("loaded", data)
    },
    loaded(entity, data) {
      entity.data = data
      entity.loading = false
    },
  },
}
```

### Cross-Entity Communication

**Redux:** Requires complex selectors and merging reducers

**Inglorious:**

```javascript
const types = {
  notification: {
    create(entity) {
      // Auto-dismiss after 3 seconds
      setTimeout(() => api.notify("remove", { id: entity.id }), 3000)
    },
  },
}
```

### Undo/Redo

Both support Redux DevTools time-travel, but Inglorious gives you finer control:

```javascript
const systems = [
  {
    onStateChange(state, prevState) {
      // Track history for undo/redo
      history.push({ state, prevState })
    },
  },
]
```

---

## Next Steps

1. **Start Small:** Migrate one slice at a time
2. **Keep Redux DevTools:** Inglorious works seamlessly with them
3. **Use `@inglorious/react-store`:** For better React integration
4. **Explore Advanced Features:** Lifecycle events, systems, `compute()`

Your Redux knowledge transfers directly — Inglorious is just cleaner!
