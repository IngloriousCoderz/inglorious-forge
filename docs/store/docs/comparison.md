---
title: Comparison
description: Compare Inglorious Store with other state management libraries.
---

# Comparison with Other State Libraries

Inglorious Store combines the best aspects of Redux, Redux Toolkit, and game engines. Here's how it compares:

## Feature Comparison

| Feature                | Redux        | RTK          | Zustand    | Jotai      | Pinia      | MobX       | Inglorious   |
| ---------------------- | ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ |
| **Boilerplate**        | 🔴 High      | 🟡 Medium    | 🟢 Low     | 🟢 Low     | 🟡 Medium  | 🟢 Low     | 🟢 Low       |
| **Multiple instances** | 🔴 Manual    | 🔴 Manual    | 🔴 Manual  | 🔴 Manual  | 🟡 Medium  | 🟡 Medium  | 🟢 Built-in  |
| **Lifecycle events**   | 🔴 No        | 🔴 No        | 🔴 No      | 🔴 No      | 🔴 No      | 🔴 No      | 🟢 Yes       |
| **Async logic**        | 🟡 Thunks    | 🟡 Complex   | 🟢 Free    | 🟢 Free    | 🟢 Free    | 🟢 Free    | 🟢 Native    |
| **Redux DevTools**     | 🟢 Yes       | 🟢 Yes       | 🟡 Partial | 🟡 Partial | 🟡 Partial | 🟢 Yes     | 🟢 Yes       |
| **Time-travel**        | 🟢 Yes       | 🟢 Yes       | 🔴 No      | 🔴 No      | 🔴 No      | 🟡 Limited | 🟢 Yes       |
| **Testability**        | 🟢 Excellent | 🟢 Excellent | 🟡 Good    | 🟡 Good    | 🟡 Good    | 🟡 Medium  | 🟢 Excellent |
| **Immutability**       | 🔴 Manual    | 🟢 Immer     | 🔴 Manual  | 🔴 Manual  | 🔴 Manual  | 🔴 Manual  | 🟢 Mutative  |

---

## Detailed Comparison

### 🎮 Entity Management

**Redux/RTK:**
Managing multiple instances requires reshaping state or creating separate reducers:

```javascript
const store = configureStore({
  reducer: {
    workTodos: todosReducer,
    personalTodos: todosReducer,
  },
})

// Adding a new list at runtime is complex
// Requires reducer refactoring or complex middleware
```

**Inglorious Store:**
Entities are first-class citizens. Add instances at runtime with no code changes:

```javascript
const entities = {
  workTodos: { type: "TodoList", todos: [] },
  personalTodos: { type: "TodoList", todos: [] },
}

// Adding new list at runtime
store.notify("add", { id: "projectTodos", type: "TodoList", todos: [] })
```

### 📦 Boilerplate

**Redux:** Action creators + reducers + setup

```javascript
// Action creators
export const addTodo = (text) => ({ type: "ADD_TODO", payload: text })

// Reducer
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { text: action.payload, done: false }]
    default:
      return state
  }
}

// Store
const store = createStore(todosReducer)
```

**Redux Toolkit:** Still boilerplate

```javascript
const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ text: action.payload, done: false })
    },
  },
})
```

**Inglorious Store:** Define types and entities, done

```javascript
const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ text, done: false })
    },
  },
}

const entities = {
  todos: { type: "TodoList", todos: [] },
}
```

### ⚡ Async Operations

**Redux:** Thunks with pending/fulfilled/rejected boilerplate

```javascript
const fetchTodos = createAsyncThunk("todos/fetch", async (userId) => {
  return fetch(`/api/users/${userId}/todos`).then((r) => r.json())
})

extraReducers: (builder) => {
  builder
    .addCase(fetchTodos.pending, (state) => {
      state.loading = true
    })
    .addCase(fetchTodos.fulfilled, (state, action) => {
      state.data = action.payload
      state.loading = false
    })
    .addCase(fetchTodos.rejected, (state) => {
      state.loading = false
    })
}
```

**Inglorious Store:** Async handlers with full control

```javascript
const types = {
  todoList: {
    async fetchTodos(entity, userId, api) {
      entity.loading = true
      const data = await fetch(`/api/users/${userId}/todos`).then((r) =>
        r.json(),
      )
      api.notify("fetchSuccess", data)
    },
    fetchSuccess(entity, data) {
      entity.todos = data
      entity.loading = false
    },
  },
}
```

### 🔄 Event System

**Redux:** Single dispatch, implicit action chains

```javascript
// One action dispatched, reducers spread across store
dispatch({ type: "ADD_TODO", payload: "Buy milk" })

// Hard to track what happens next
```

**Inglorious Store:** Explicit pub/sub with targeted events

```javascript
// Broadcast to all handlers
store.notify("taskCompleted", "task123")

// Target specific entity
store.notify("#work:taskCompleted", "task123")

// Target specific type
store.notify("stats:taskCompleted", "task123")
```

### ♻️ Lifecycle

**Redux/RTK/Others:** No built-in lifecycle

```javascript
// Must manually handle setup/cleanup
// No pattern for entity creation/destruction
```

**Inglorious Store:** Built-in lifecycle events

```javascript
const types = {
  myType: {
    create(entity) {
      // Automatic on add
      entity.createdAt = Date.now()
    },
    destroy(entity, api) {
      // Automatic on remove
      console.log(`Cleaning up ${entity.id}`)
    },
  },
}

store.notify("add", { id: "entity1", type: "MyType" })
store.notify("remove", "entity1")
```

### 🚀 Performance

| Library    | Immutability Strategy   | Rerender Cost |
| ---------- | ----------------------- | ------------- |
| Redux      | Manual spread operators | High          |
| RTK        | Immer                   | Medium        |
| Zustand    | Manual                  | Variable      |
| Inglorious | Mutative                | Low           |

Inglorious Store uses **Mutative** for 10x faster immutability than Immer:

```javascript
entity.value = 100 // Looks like mutation
// Actually immutable under the hood
// 10x faster than Immer
```

### 🧪 Testing

**Redux Reducers:**

```javascript
const state = todosReducer([{ id: 1, text: "Test", done: false }], {
  type: "ADD_TODO",
  payload: "New todo",
})
expect(state[1].text).toBe("New todo")
```

**Inglorious Store Handlers:**

```javascript
import { trigger } from "@inglorious/store/test"

const { entity } = trigger(
  { type: "TodoList", todos: [] },
  todoListType.addTodo,
  "New todo",
)
expect(entity.todos[0].text).toBe("New todo")
```

Both test easily, but Inglorious provides test utilities.

### 💾 DevTools & Debugging

| Library    | DevTools   | Time Travel | Inspector  |
| ---------- | ---------- | ----------- | ---------- |
| Redux      | ✅ Full    | ✅ Yes      | ✅ Yes     |
| RTK        | ✅ Full    | ✅ Yes      | ✅ Yes     |
| Zustand    | ⚠️ Limited | ❌ No       | ⚠️ Limited |
| Jotai      | ⚠️ Limited | ❌ No       | ⚠️ Limited |
| Inglorious | ✅ Full    | ✅ Yes      | ✅ Yes     |

Inglorious Store provides full Redux DevTools support out of the box.

---

## When to Use Each

### Use Redux/RTK if:

- ✅ You need maximum ecosystem support
- ✅ You're working on a large team with Redux experience
- ✅ You want proven battle-tested patterns
- ❌ You'll benefit from entity-based architecture
- ❌ You need built-in lifecycle events

### Use Inglorious Store if:

- ✅ You want minimal boilerplate
- ✅ You manage multiple entity instances
- ✅ You want integrated async and lifecycle handling
- ✅ You're starting a new project
- ✅ You like game engine patterns

### Use Zustand/Jotai if:

- ✅ You want ultra-lightweight state
- ✅ You don't need Redux DevTools
- ✅ You're building a small app
- ❌ You need entity management patterns
- ❌ You want Redux compatibility

### Use Pinia/MobX if:

- ✅ You're using Vue (Pinia)
- ✅ You want reactive, observable patterns (MobX)
- ❌ You need Redux compatibility
- ❌ You want game engine-inspired patterns

---

## Migration Paths

### From Redux → Inglorious Store

- Drop-in replacement (same API with `react-redux`)
- Keep existing components unchanged
- Gradually convert slices to types
- Full guide available: [Migrate from Redux](/advanced/migration)

### From RTK → Inglorious Store

- Convert slices to types
- Convert thunks to async handlers
- Migration utilities provided
- Full guide available: [Migrate from Redux](/advanced/migration)

### From Zustand/Jotai → Inglorious Store

- Rewrite atoms as types
- Adopt entity-based patterns
- Gain DevTools and lifecycle benefits

---

## Conclusion

**Inglorious Store is the sweet spot** for projects that need:

1. Redux-like predictability and debugging
2. Minimal boilerplate
3. Entity management without reshaping state
4. Built-in lifecycle handling
5. Native async support

Choose Inglorious Store if you want the simplicity of game engines in your state management.
