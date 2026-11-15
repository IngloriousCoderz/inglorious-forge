---
title: Getting Started
description: Install and set up Inglorious Store in your project.
---

# Getting Started

## Installation

Install Inglorious Store using your favorite package manager:

```bash
pnpm add @inglorious/store
```

## Basic Usage

Inglorious Store exposes the store methods Redux tooling expects, `dispatch`, `subscribe` and `getState`, so `react-redux` and the Redux DevTools work with it unchanged. The way you define state and logic is different from Redux.

### **Key Differences from Redux**

- **No Reducers or Action Creators:** Inglorious Store uses an **entity-based architecture**.
- **Event Handlers:** Logic is encapsulated in event handlers attached to entity types.
- **Dynamic Entities:** Add or remove entities at runtime without reshaping the state.

## Creating a Store

Here’s how to create a store with Inglorious Store:

```javascript
import { createStore } from "@inglorious/store"

// Define entity types
const types = {
  TodoList: {
    todoAdd(entity, text) {
      entity.todos.push({ id: Date.now(), text })
    },
  },
}

// Define initial entities
const entities = {
  work: { type: "TodoList", todos: [] },
  personal: { type: "TodoList", todos: [] },
}

// Create the store
const store = createStore({ types, entities })

// Use the store
store.notify("todoAdd", "Buy groceries")
```

## Migrating from Redux

While the external API is compatible with Redux, migrating your logic requires rethinking how state and logic are defined:

1. **Replace Reducers with Event Handlers:**
   - In Redux, reducers handle actions and return new state.
   - In Inglorious Store, event handlers react to events and update entities.

2. **Replace Action Creators with Direct Notifications:**
   - You no longer need action creators. Use `store.notify("eventName", payload)`.

3. **Organize State as Entities:**
   - Instead of a single state object, split your state into reusable entities.

## Understanding Events

Inglorious Store uses a **pub/sub event system** instead of Redux's single-dispatch model. When you notify an event, all entities with a handler for that event can respond:

```javascript
const types = {
  TodoList: {
    taskAdd(entity, task) {
      entity.tasks.push(task)
    },
  },
  Stats: {
    taskAdd(entity, task) {
      entity.totalTasks++
    },
  },
}

// Both handlers fire when you notify
store.notify("taskAdd", { text: "Buy milk" })
```

You can also **target specific entities**:

```javascript
// Only notify the work list
store.notify("#work:taskAdd", { text: "Meeting at 3pm" })

// Only notify TodoList entities
store.notify("TodoList:taskAdd", { text: "Review PR" })
```

Learn more: [Event System →](/guide/event-system)

## Next Steps

- **[What is Inglorious Store?](/guide/what-is)** - Understand the philosophy and inspiration
- **[Core Concepts](/guide/core-concepts)** - Deep dive into entities and types
- **[Event System](/guide/event-system)** - Master pub/sub and targeted notifications
- **[Async Operations](/advanced/async-operations)** - Handle API calls and async logic
- **[API Reference](/api/reference)** - Complete API documentation
