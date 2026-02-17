---
title: What is Inglorious Store?
description: Understanding Inglorious Store - what it is, what it isn't, and its inspiration from game engines.
---

# What is Inglorious Store?

## In One Sentence

A **Redux-compatible, entity-based state library** that brings game engine design patterns to web state management, eliminating boilerplate while maintaining predictability and testability.

---

## What It Is

### ✅ A State Management Library

Inglorious Store manages application state, much like Redux, Zustand, or Pinia. It provides:

- **Centralized state** - Single source of truth for your app
- **Predictable updates** - Pure functions transform state
- **Reactive** - Components re-render when state changes
- **Debuggable** - Full Redux DevTools support with time-travel

### ✅ Redux-Compatible

It's a **drop-in replacement for Redux**:

```javascript
// Works with react-redux
import { Provider, useSelector, useDispatch } from "react-redux"

const store = createStore({ types, entities })

function App() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

// Your components don't change!
```

### ✅ Entity-Based

Unlike traditional state trees, entities are **first-class citizens**:

```javascript
// Define behavior once
const types = {
  counter: {
    increment(e) {
      e.value++
    },
  },
}

// Create multiple instances without code duplication
const entities = {
  counter1: { type: "counter", value: 0 },
  counter2: { type: "counter", value: 0 },
  counter3: { type: "counter", value: 0 },
}

// Add new instances at runtime
store.notify("add", { id: "counter4", type: "counter", value: 0 })
```

### ✅ Event-Driven

Everything happens through **events**:

```javascript
// Broadcast to all handlers
store.notify("taskCompleted", "task123")

// Target specific entity
store.notify("#work:taskCompleted", "task123")

// Target specific type
store.notify("stats:taskCompleted", "task123")

// All updates are queued and predictable
```

### ✅ No Boilerplate

Compare three approaches:

**Redux:**

```javascript
const addTodo = (text) => ({ type: "ADD_TODO", payload: text })
const reducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { text: action.payload }]
    default:
      return state
  }
}
```

**Redux Toolkit:**

```javascript
const slice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ text: action.payload })
    },
  },
})
```

**Inglorious Store:**

```javascript
const todoList = {
  addTodo(entity, text) {
    entity.todos.push({ text })
  },
}
```

### ✅ Built-in Lifecycle

Entities have automatic lifecycle events:

```javascript
const user = {
  create(entity) {
    // Runs when entity is added
    entity.createdAt = Date.now()
  },

  destroy(entity) {
    // Runs when entity is removed
    saveToDatabase(entity)
  },
}
```

---

## What It Isn't

### ❌ Not a Reactive Proxy System

**Zustand, Jotai, Valtio** use proxies and reactivity. Inglorious Store is **explicit and declarative**:

```javascript
// Inglorious Store: Explicit event handlers
store.notify("increment", 5)

// NOT implicit reactivity
// state.counter.value++  // ❌ Won't work
```

### ❌ Not Minimalist

**Zustand** and **Jotai** optimize for minimal code size. Inglorious Store optimizes for **minimal boilerplate at scale**:

```javascript
// Zustand: Small for one store
const useStore = create((set) => ({
  counter: 0,
  increment: () => set((state) => ({ counter: state.counter + 1 }))
}))

// Inglorious: Scales better with many entities
const types = {
  counter: { increment(e) { e.value++ } }
}
const entities = {
  counter1, counter2, counter3, ... // 100 instances, same code
}
```

### ❌ Not Observable/Reactive (like MobX)

**MobX** tracks accessed properties. Inglorious Store **doesn't** automatically track dependencies:

```javascript
// MobX: Magical tracking
observable.counter++ // Reactivity happens automatically

// Inglorious: Explicit events
store.notify("increment") // You control what happens
```

### ❌ Not a Database

**Pinia** and some others blur the line between state and database. Inglorious Store is **purely in-memory state**. For persistence, use:

```javascript
// You control persistence
const saveState = () =>
  localStorage.setItem("state", JSON.stringify(store.getState()))
store.subscribe(saveState)
```

### ❌ Not a Framework

It works with **React, Vue, or vanilla JS**. It doesn't provide:

- UI components
- Routing
- HTTP client
- Form handling

---

## Inspiration from Game Engines

Game engines have solved state complexity for decades. Inglorious Store borrows three core patterns:

### 1. Entity-Component-System (ECS)

**Game engines:**

```
Entity = Instance (Player, Enemy, NPC)
Component = Data (Position, Health, Damage)
System = Logic (Physics, Collision, Rendering)
```

**Inglorious Store adaptation:**

```javascript
Entity = Instance of a type (todoList, user, settings)
Behavior = Logic (addTodo, setTheme, login)
System = Global logic (cleanup, analytics, validation)
```

### 2. Event Queue

Game engines queue events to maintain predictability:

```javascript
// All events process together in one frame
frame
  .start()
  .notify("playerMoved", { x: 100 })
  .notify("enemyAttacked", { damage: 10 })
  .notify("particleCreated", { type: "explosion" })
frame.update() // Single re-render
```

All events in Inglorious Store are appended to an event queue as well.

### 3. Batch Updates

Instead of re-rendering after every event (Redux), batch them (like game engines):

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual", // You control when to re-render
})

store.notify("event1", payload1)
store.notify("event2", payload2)
store.notify("event3", payload3)

store.update() // Single re-render for all three
```

---

## Why Not Fully ECS?

ECS is **low-level systems programming**. It optimizes for:

- CPU cache locality
- Memory layout
- Iteration speed
- Parallel processing

**Inglorious Store** optimizes for:

- Developer ergonomics
- Code simplicity
- Predictability
- Web applications

### The Tradeoffs

**True ECS (game engines):**

```
✅ Extreme performance
✅ Flexible composition
❌ Complex to understand
❌ Overkill for most web apps
❌ Requires intimate memory knowledge
```

**Inglorious Store (inspired by ECS):**

```
✅ ECS concepts without complexity
✅ Simple for web developers
✅ Minimal boilerplate
✅ Full debugging support
❌ Not optimized for 100k+ entities
❌ Not suitable for low-level systems
```

Think of it as **"ECS philosophy for web development"** rather than a true ECS implementation.

---

## Key Differences from Redux

| Aspect                 | Redux                            | Inglorious              |
| ---------------------- | -------------------------------- | ----------------------- |
| **Action Creators**    | Required                         | Not needed              |
| **Reducers**           | Required                         | Event handlers          |
| **Multiple Instances** | Manual reshaping                 | Built-in                |
| **Async Logic**        | Thunks + middleware              | Native async handlers   |
| **Lifecycle**          | Manual setup/teardown            | Built-in create/destroy |
| **Event Broadcasting** | All reducers receive all actions | Selective handlers      |
| **Batch Updates**      | Automatic                        | Optional manual control |
| **DevTools**           | Full support                     | Full support            |
| **Migration**          | Drop-in replacement              | Same API                |

---

## Perfect For

✅ **Applications with multiple entity instances** (todos, teams, projects, chats)  
✅ **Real-time collaborative features** (multiple users, shared state)  
✅ **Complex async flows** (loading, error, retry, polling)  
✅ **Games and simulations** (entities, lifecycle, batch updates)  
✅ **Rich dashboards** (many independent widgets/entities)

---

## Not the Best Choice For

❌ **Ultra-lightweight apps** (use Zustand/Jotai)  
❌ **Purely reactive UIs** (use MobX)  
❌ **Non-JavaScript environments** (use Redux, MobX)  
❌ **Apps with 100k+ simultaneous entities** (use a game engine)

---

## The Philosophy

> **Inglorious Store brings the wisdom of game engines to web development, without the complexity.**

State management should be:

1. **Simple** - No action creators or reducer boilerplate
2. **Predictable** - Pure functions and event queues
3. **Scalable** - Multiple instances without code duplication
4. **Debuggable** - Full Redux DevTools support
5. **Testable** - Pure functions are easy to test

That's Inglorious Store.

---

## Next Steps

- **[Get Started](/guide/getting-started)** - Installation and setup
- **[Core Concepts](/guide/core-concepts)** - Understand entities, types, and events
- **[Comparison](/comparison)** - How it compares to other libraries
- **[API Reference](/api/reference)** - Complete API documentation
