# @inglorious/react-store

[![NPM version](https://img.shields.io/npm/v/@inglorious/react-store.svg)](https://www.npmjs.com/package/@inglorious/react-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official React bindings for **[@inglorious/store](https://www.npmjs.com/package/@inglorious/store)**.

Connect your React app to Inglorious Store with a familiar API. Built on `react-redux` for rock-solid performance and compatibility.

---

## Features

- **Drop-in Integration**: Works just like `react-redux` with enhanced features for Inglorious Store
- **Custom `useNotify` Hook**: Dispatch events with a clean, ergonomic API
- **Convenience `useEntity` Hook**: Select a single entity by its ID with a simple, optimized hook.
- **Battle-tested**: Built on `react-redux` for proven performance and stability
- **TypeScript Support**: Optional type safety for those who want it

---

## Installation

```bash
npm install @inglorious/store @inglorious/react-store react react-dom
```

---

## Quick Start

### 1. Create Your Store

```javascript
// store.js
import { createStore } from "@inglorious/store"

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

const entities = {
  myCounter: { type: "Counter", value: 0 },
}

export const store = createStore({ types, entities })
```

### 2. Set Up React Bindings

```javascript
// react-store.js
import { createReactStore } from "@inglorious/react-store"
import { store } from "./store"

export const { Provider, useSelector, useNotify, useEntity } =
  createReactStore(store)
```

### 3. Wrap Your App

```jsx
// App.jsx
import { Provider } from "./react-store"

function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  )
}
```

### 4. Use in Components

```jsx
// Counter.jsx
import { useNotify, useEntity } from "./react-store"

function Counter() {
  const notify = useNotify()
  const { value } = useEntity("myCounter")

  return (
    <div>
      <h1>Count: {value}</h1>
      <button onClick={() => notify("increment")}>+</button>
      <button onClick={() => notify("decrement")}>-</button>
    </div>
  )
}
```

---

## API Reference

### `createReactStore(store)`

Creates React bindings for an Inglorious Store.

**Parameters:**

- `store` (required): An Inglorious Store instance

**Returns:**

- `Provider`: React context provider component (pre-configured with your store)
- `useSelector`: Hook to select state slices
- `useNotify`: Hook to dispatch events
- `useEntity`: Hook to select a single entity by ID

**Examples:**

```javascript
const { Provider, useSelector, useNotify, useEntity } = createReactStore(store)
```

### `useNotify()`

Hook that returns a function to dispatch events.

**Returns:**

- `notify(type, payload?)`: Function to dispatch events

**Usage:**

```jsx
function TodoItem({ id }) {
  const notify = useNotify()

  // Simple event
  const handleToggle = () => notify("toggleTodo", id)

  // Event with complex payload
  const handleRename = (text) => notify("renameTodo", { id, text })

  return (
    <div>
      <button onClick={handleToggle}>Toggle</button>
      <input onChange={(e) => handleRename(e.target.value)} />
    </div>
  )
}
```

### `useSelector(selector, equalityFn?)`

Hook to select and subscribe to state slices. Works exactly like `react-redux`'s `useSelector`.

**Parameters:**

- `selector`: Function that receives state and returns a slice
- `equalityFn` (optional): Custom equality function for optimization

**Usage:**

```jsx
function TodoList() {
  // Select a specific entity
  const task = useSelector((state) => state.task1)

  // Select derived data
  const completedCount = useSelector(
    (state) => Object.values(state).filter((task) => task.completed).length,
  )

  // With custom equality
  const tasks = useSelector(
    (state) => state.tasks,
    (prev, next) => prev === next, // Shallow equality
  )

  return <div>...</div>
}
```

### `useEntity(id)`

A convenience hook to select a single entity by its ID. It is an optimized way to subscribe a component to updates for a specific entity.

**Parameters:**

- `id` (required): The ID of the entity to select.

**Usage:**

```jsx
function UserProfile() {
  const user = useEntity("user-123")
  if (!user) {
    return "User not found."
  }

  return user.name
}
```

---

## Redux DevTools Integration

Redux DevTools work automatically! Install the browser extension to inspect state snapshots, event history, and use time-travel debugging.

The underlying `@inglorious/store` allows for configuration, such as skipping certain events from being logged. See the store documentation for more details.

---

## Complete Example: Todo App

```javascript
// store.js
import { createStore } from "@inglorious/store"

const types = {
  form: {
    inputChange(entity, value) {
      entity.value = value
    },
    formSubmit(entity) {
      entity.value = ""
    },
  },

  list: {
    formSubmit(entity, value) {
      entity.tasks.push({
        id: Date.now(),
        text: value,
        completed: false,
      })
    },
    toggleClick(entity, id) {
      const task = entity.tasks.find((t) => t.id === id)
      if (task) task.completed = !task.completed
    },
  },
}

const entities = {
  form: { type: "Form", value: "" },
  list: { type: "List", tasks: [] },
}

export const store = createStore({ types, entities })
```

```javascript
// react-store.js
import { createReactStore } from "@inglorious/react-store"
import { store } from "./store"

export const { Provider, useSelector, useNotify } = createReactStore(store)
```

```jsx
// App.jsx
import { Provider } from "./react-store"
import TodoApp from "./TodoApp"

export default function App() {
  return (
    <Provider>
      <TodoApp />
    </Provider>
  )
}
```

```jsx
// TodoApp.jsx
import { useNotify, useSelector } from "./react-store"

export default function TodoApp() {
  const notify = useNotify()

  const formValue = useSelector((state) => state.form.value)
  const tasks = useSelector((state) => state.list.tasks)

  const handleSubmit = (e) => {
    e.preventDefault()
    notify("formSubmit", formValue)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={formValue}
          onChange={(e) => notify("inputChange", e.target.value)}
          placeholder="Add a task"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => notify("toggleClick", task.id)}
            />
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## TypeScript Support

Full TypeScript support is available! The library includes complete type definitions.

**Quick example:**

```typescript
// Define your types
import { BaseEntity } from "@inglorious/store"

interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

interface AppState {
  myCounter: CounterEntity
  [id: string]: CounterEntity
}

// Create typed store
const store = createStore<CounterEntity, AppState>({ types, entities })

// Everything else works the same!
const { Provider, useSelector, useNotify } = createReactStore(store)
```

For complete TypeScript examples, see the [@inglorious/store TypeScript documentation](https://www.npmjs.com/package/@inglorious/store#-type-safety).

---

## FAQ

**Q: Can I use this with existing react-redux code?**  
A: Yes! The `Provider` and `useSelector` are compatible. You can gradually migrate to `useNotify`.

**Q: Does this work with React Native?**  
A: Yes! It works anywhere `react-redux` works.

**Q: Can I use Redux middleware?**  
A: Use Inglorious Store middleware instead. See [@inglorious/store docs](https://www.npmjs.com/package/@inglorious/store).

**Q: Do I need TypeScript?**  
A: Not at all! The library works great with plain JavaScript. TypeScript support is completely optional.

---

## Comparison to Plain react-redux

**What's the same:**

- `<Provider>` and `useSelector` work identically
- Full Redux DevTools support
- Same performance characteristics

**What's different:**

- ✅ `useNotify` hook for dispatching events instead of `useDispatch`
- ✅ `useEntity` hook for easily selecting an entity by ID
- ✅ Cleaner API for event-based state management

---

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.

---

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](../../CONTRIBUTING.md) first.
