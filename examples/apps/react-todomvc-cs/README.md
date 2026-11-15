# TodoMVC-CS - Client-Server with Async Operations

A TodoMVC implementation using **[@inglorious/store](https://www.npmjs.com/package/@inglorious/store)** with **[@inglorious/react-store](https://www.npmjs.com/package/@inglorious/react-store)** bindings, demonstrating **async API calls** and **event chaining** with a RESTful backend.

This demo showcases cascading notifications for real-world client-server applications.

---

## ✨ Key Features

This implementation demonstrates:

1. **useNotify Hook**: Cleaner API than `useDispatch`
2. **Event Chaining**: Async handlers trigger sync handlers automatically
3. **RESTful API Integration**: Real server communication with `json-server`
4. **Async/Sync Separation**: Clean split between I/O and state updates

---

## 🎯 Event Chaining

When fetching data from an API, you need two separate handlers:

1. **Async handler** - performs the fetch
2. **Sync handler** - updates the state with the result

Contrary to Redux/RTK, an event handler can notify of other events. We give up a little bit of purity, but maintain predictability thanks to the store's internal **event queue**.

### The Pattern:

```javascript
const types = {
  list: {
    // 1. Async handler - fetches from API
    async formSubmit(entity, value, api) {
      const createdTask = await client.createTask({ text: value })

      // 2. Trigger sync handler (processes in same update cycle!)
      api.notify("taskCreated", createdTask)
    },

    // 3. Sync handler - updates state
    taskCreated(entity, createdTask) {
      entity.tasks.push(createdTask)
    },
  },
}
```

**Why this pattern:**

- ✅ Separation of concerns (fetch vs state update)
- ✅ Each handler is independently testable
- ✅ Clean, declarative flow
- ✅ Both events process in one React render

### ✅ Testing

This separation makes testing easy. You can mock the API client, dispatch the async event, and assert the final state.

```javascript
// src/store/types.test.js
it("should create a task on formSubmit", async () => {
  // 1. Mock the client and create a store
  client.createTask.mockResolvedValue(mockTask)
  const store = createStore({ types, entities })

  // 2. Dispatch the async event and assert the final state
  await store.dispatch({ type: "formSubmit", payload: "New Task" })
  expect(store.getState().list.tasks).toEqual([mockTask])
})
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (recent version)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

```bash
pnpm install
```

### 1. Start the Mock API Server

The app uses `json-server` for a RESTful backend:

```bash
pnpm api
```

This starts the API server on `http://localhost:3000`.

### 2. Start the Frontend Application

In a separate terminal:

```bash
pnpm dev
```

The application will launch on `http://localhost:5173/`.

### Build for Production

```bash
pnpm build
```

---

## 📁 Project Structure

State management files are in `src/store/`:

| File                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `src/store/index.js`       | Store setup with `@inglorious/react-store`   |
| `src/store/entities.js`    | Initial state for all entities               |
| `src/store/types.js`       | **Async event handlers** with event chaining |
| `src/store/types.test.js`  | Unit tests for the event handlers            |
| `src/store/middlewares.js` | Functions that augment the store's behavior  |
| `src/store/selectors.js`   | Memoized selectors for derived state         |
| `src/services/client.js`   | API client functions                         |

---

## 🔍 How It Works

### Using `@inglorious/react-store`

```javascript
// src/store/index.js
import { createStore } from "@inglorious/store"
import { createReactStore } from "@inglorious/react-store"

const store = createStore({ types, entities })

export const { Provider, useSelector, useNotify } = createReactStore(store)

// App.jsx
function App() {
  return (
    <Provider>
      <Form />
      <List />
    </Provider>
  )
}

// Form.jsx
function Form() {
  const notify = useNotify()
  const value = useSelector((state) => state.form.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    notify("formSubmit", value)
  }

  // ... render logic
}
```

### Async Event Chaining Pattern

The key pattern: **async handler → api.notify() → sync handler**

```javascript
// src/store/types.js
import * as client from "../services/client"

export const types = {
  list: {
    // Load todos from server on mount
    async loadTasks(entity, payload, api) {
      entity.loading = true
      const tasks = await client.getTasks()
      api.notify("tasksLoaded", tasks)
    },

    tasksLoaded(entity, tasks) {
      entity.tasks = tasks
      entity.loading = false
    },

    // Create new todo
    async formSubmit(entity, value, api) {
      const createdTask = await client.createTask({ text: value })
      api.notify("taskCreated", createdTask)
    },

    taskCreated(entity, createdTask) {
      entity.tasks.push(createdTask)
    },

    // Update todo
    async taskToggle(entity, id, api) {
      const task = entity.tasks.find((t) => t.id === id)
      const updatedTask = await client.updateTask(id, {
        completed: !task.completed,
      })
      api.notify("taskUpdated", updatedTask)
    },

    taskUpdated(entity, updatedTask) {
      const task = entity.tasks.find((t) => t.id === updatedTask.id)
      if (task) {
        task.completed = updatedTask.completed
      }
    },

    // Delete todo
    async taskDelete(entity, id, api) {
      await client.deleteTask(id)
      api.notify("taskDeleted", id)
    },

    taskDeleted(entity, id) {
      const index = entity.tasks.findIndex((t) => t.id === id)
      if (index !== -1) {
        entity.tasks.splice(index, 1)
      }
    },
  },
}
```

### Using in Components

```javascript
import { useNotify, useSelector } from "../store"

function TodoList() {
  const notify = useNotify()
  const tasks = useSelector((state) => state.list.tasks)
  const loading = useSelector((state) => state.list.loading)

  // Load tasks on mount
  useEffect(() => {
    notify("loadTasks")
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
```

## 💡 Why Event Chaining?

Without event chaining, Mutative prevents us from mutating the entity since its proxy has become obsolete by the time the promise is fulfilled:

```javascript
const list = {
  async loadTasks(entity, value) {
    const task = await fetch('/api/tasks', { method: 'POST', ... })
    entity.tasks.push(task) // TypeError: Cannot perform 'set' on a proxy that has been revoked
  },
}
```

Event chaining feels more natural anyway, and makes sync logic more testable and reusable:

```javascript
const list = {
  // ✅ Separation of concerns
  async loadTasks(entity, value, api) {
    const task = await fetch('/api/tasks', { method: 'POST', ... })
    api.notify('taskCreated', task) // Trigger separate handler
  },

  taskCreated(entity, task) {
    entity.tasks.push(task) // Pure state update
  },
}
```

**Benefits:**

- ✅ Async handler only handles I/O
- ✅ Sync handler only handles state
- ✅ Each is independently testable
- ✅ Can reuse `taskCreated` from other sources (WebSocket, local creation, etc.)

---

## 🎭 Pub/Sub Event Architecture

Just like the basic TodoMVC, this uses a **pub/sub system**. Multiple entities can respond to the same event:

```javascript
const types = {
  list: {
    taskCreated(entity, task) {
      entity.tasks.push(task)
    },
  },

  notification: {
    taskCreated(entity, task) {
      entity.message = `Created: ${task.text}`
      entity.show = true
    },
  },

  analytics: {
    taskCreated(entity, task) {
      entity.totalCreated++
    },
  },
}

// One event, three entities respond!
api.notify("taskCreated", newTask)
```

---

## 💡 Comparison with Redux Toolkit

### Redux Toolkit (createAsyncThunk):

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Async thunk
const fetchTodos = createAsyncThunk("list/fetchTodos", async () => {
  const response = await fetch("/api/todos")
  return response.json()
})

// Slice with three separate handlers
const listSlice = createSlice({
  name: "list",
  initialState: { tasks: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.tasks = action.payload
        state.loading = false
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.error = action.error.message
        state.loading = false
      })
  },
})

// Need to distinguish pending/fulfilled/rejected
```

**RTK Complexity:**

- ❌ Need `createAsyncThunk`
- ❌ Three separate handlers (pending/fulfilled/rejected)
- ❌ Builder notation with `extraReducers`
- ❌ More boilerplate
- ❌ Harder to coordinate with other slices

To be fair, there is also a cleaner way in RTK: `create.asyncThunk`. This requires however to create a new `createAppSlice` function, as described [here](https://redux-toolkit.js.org/api/createSlice#createasyncthunk).

### With @inglorious/store:

```javascript
const types = {
  list: {
    async loadTasks(entity, payload, api) {
      try {
        entity.loading = true
        const tasks = await client.getTasks()
        api.notify("tasksLoaded", tasks)
      } catch (error) {
        api.notify("tasksFailed", error)
      }
    },

    tasksLoaded(entity, tasks) {
      entity.tasks = tasks
      entity.loading = false
    },

    tasksFailed(entity, error) {
      entity.error = error.message
      entity.loading = false
    },
  },
}

// Just two handlers - async and sync
```

**Benefits:**

- ✅ No `createAsyncThunk`
- ✅ No builder notation
- ✅ Less boilerplate
- ✅ Natural error handling with try/catch
- ✅ Other entities can easily respond to `tasksLoaded`

---

## 📚 Learn More

- **[@inglorious/store](https://www.npmjs.com/package/@inglorious/store)** - Core state management docs
- **[@inglorious/react-store](https://www.npmjs.com/package/@inglorious/react-store)** - React bindings documentation
- **[todomvc](../todomvc)** - Basic version with `react-redux` (synchronous only)

---

## 📄 License

MIT © [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)
