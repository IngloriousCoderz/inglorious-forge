---
title: Event System
description: Understanding Inglorious Store's pub/sub event system with targeted notifications and event scoping.
---

# Event System

Inglorious Store's event system is the core mechanism for state updates. It uses a **pub/sub architecture** with **targeted notifications** and an **event queue** for predictable, batch-able updates.

---

## Event Broadcasting (Pub/Sub)

By default, events are **broadcast** to all entities with a handler for that event:

```javascript
const types = {
  todoList: {
    taskCompleted(entity, taskId) {
      // This runs for every todoList entity
      const task = entity.tasks.find((t) => t.id === taskId)
      if (task) task.completed = true
    },
  },
  stats: {
    taskCompleted(entity, taskId) {
      // This also runs (if defined on stats)
      entity.completedCount++
    },
  },
  notifications: {
    taskCompleted(entity, taskId) {
      // And this runs too
      entity.messages.push("Task completed!")
    },
  },
}

// One event, three handlers fire
store.notify("taskCompleted", "task123")
```

**Key benefit:** New entity types can react to existing events without changing other code.

---

## Targeted Notifications

Sometimes you want to limit which entities receive an event. Inglorious Store supports three levels of targeting:

### 1. Broadcast to All (Default)

```javascript
store.notify("eventName", payload)
```

All entities with an `eventName` handler receive it.

```javascript
const types = {
  counter: {
    increment(e) {
      e.value++
    },
  },
  timer: {
    increment(e) {
      e.elapsed++
    },
  },
}

store.notify("increment", null)
// Both counter and timer increment handlers fire
```

### 2. Target by Type

```javascript
store.notify("typeName:eventName", payload)
```

Only entities of `typeName` receive the event.

```javascript
store.notify("counter:increment", null)
// Only counter entities increment
// timer does NOT receive it
```

### 3. Target by Entity ID

```javascript
store.notify("#entityId:eventName", payload)
```

Only the entity with that ID receives the event.

```javascript
store.notify("#counter1:increment", null)
// Only counter1 increments
// counter2 does NOT receive it
```

### 4. Target by Type and ID (Explicit)

```javascript
store.notify("typeName#entityId:eventName", payload)
```

Only the specific entity of that type receives it. Useful if multiple types might share entity IDs.

```javascript
store.notify("counter#counter1:increment", null)
// Explicitly targets counter1 of type counter
```

---

## Common Patterns

### Pattern 1: Broadcast with Self-Check

Use broadcasting with a guard clause when you want multiple types to react but need selective behavior:

```javascript
const types = {
  todoList: {
    toggle(entity, todoId) {
      // Run for ALL todoList entities
      // But only update if this list owns the todo
      if (!entity.todos.find((t) => t.id === todoId)) {
        return // Skip if not in this list
      }

      const todo = entity.todos.find((t) => t.id === todoId)
      if (todo) todo.completed = !todo.completed
    },
  },
  stats: {
    toggle(entity) {
      // Stats always reacts
      entity.totalToggled++
    },
  },
}

store.notify("toggle", "todo123")
// todoList handlers check internally
// stats always increments
```

### Pattern 2: Targeted Notification

Use targeted notifications when you want to avoid broadcasting entirely:

```javascript
const types = {
  todoList: {
    toggle(entity, todoId) {
      const todo = entity.todos.find((t) => t.id === todoId)
      if (todo) todo.completed = !todo.completed
    },
  },
}

// Target only the list that owns this todo
store.notify("#workTodos:toggle", "todo123")
// Only workTodos list handles it
```

### Pattern 3: Cross-Entity Communication

Use targeted notifications for one entity to trigger another:

```javascript
const types = {
  form: {
    submit(entity, data, api) {
      // Form submits
      api.notify("formSubmitted", data)
      // Notify a specific list to update
      api.notify("#workTodos:refreshAfterSubmit", data)
    },
  },
  todoList: {
    refreshAfterSubmit(entity, data) {
      // Only called when form targets this list
      entity.refresh()
    },
  },
}
```

---

## Event Queue

Inglorious Store queues events before processing them. This ensures:

1. **Predictable order** - Events process in the order they were notified
2. **Atomic updates** - All events in a batch process together before subscribers are notified
3. **No interleaving** - Sync and async handlers don't race

### Auto Update Mode (Default)

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "auto", // Events trigger immediately
})

store.notify("event1", payload1) // Re-render after this
store.notify("event2", payload2) // Re-render after this
// Result: 2 re-renders
```

### Manual Update Mode

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual", // You control when events process
})

// Queue multiple events
store.notify("playerMoved", { x: 100, y: 50 })
store.notify("enemySpotted", { enemyId: "e1" })
store.notify("sound:play", { type: "footstep" })

// Process all at once
store.update() // Single re-render
```

**Why this matters:** In games or complex UIs, batching updates prevents intermediate states from rendering.

---

## Event Lifecycle

When you dispatch an event, here's what happens:

```
1. notify(eventType, payload)
   ↓
2. Event queued
   ↓
3. In updateMode: "auto" → immediately execute next step
   In updateMode: "manual" → wait for update() call
   ↓
4. Find all entities that handle this event
   ↓
5. Execute each handler synchronously
   ↓
6. If handler calls api.notify(), queue those events
   ↓
7. Continue with next queued event
   ↓
8. All events processed
   ↓
9. Notify React/Vue subscribers (one batched notification)
```

### Example with Multiple Events

```javascript
store.notify("event1", p1)
// Queued: [event1]

api.notify("event2", p2) // Called from event1 handler
// Queued: [event2]

// event1 finishes, event2 starts
// When event2 handler calls api.notify("event3", p3)
// Queued: [event3]

// All three process, then subscribers notified once
```

---

## Async Events in the Queue

Async handlers work seamlessly with the queue:

```javascript
const types = {
  todoList: {
    async fetchTodos(entity, userId, api) {
      entity.loading = true

      // Await outside the queue
      const data = await fetch(`/api/users/${userId}/todos`).then((r) =>
        r.json(),
      )

      // Back into queue: notify other handlers
      api.notify("fetchSuccess", data)
    },

    fetchSuccess(entity, data) {
      entity.todos = data
      entity.loading = false
    },
  },
}

// Dispatch
store.notify("fetchTodos", userId)

// Flow:
// 1. fetchTodos handler starts
// 2. Sets entity.loading = true
// 3. Awaits fetch (queued handlers pause)
// 4. fetch completes
// 5. api.notify("fetchSuccess") queues new event
// 6. fetchSuccess handler runs
// 7. Sets todos and loading = false
// 8. All subscribers notified once
```

---

## Event Scoping with handleAsync

The `handleAsync` helper generates multiple events with different scopes:

```javascript
import { handleAsync } from "@inglorious/store"

const types = {
  todoList: {
    ...handleAsync(
      "fetchTodos",
      {
        async run(entity, userId, api) {
          return fetch(`/api/${userId}/todos`).then((r) => r.json())
        },
        success(entity, data) {
          entity.todos = data
        },
      },
      {
        scope: "entity", // Default: only affects this entity
      },
    ),
  },
}
```

Generated events by scope:

**Entity scope (default):**

```
#entityId:fetchTodos        (initial event)
#entityId:fetchTodosRun     (when running)
#entityId:fetchTodosSuccess (on success)
#entityId:fetchTodosError   (on error)
```

**Type scope:**

```
todoList:fetchTodos         (initial event)
todoList:fetchTodosRun      (when running)
todoList:fetchTodosSuccess  (on success)
todoList:fetchTodosError    (on error)
```

**Global scope:**

```
fetchTodos                  (initial event)
fetchTodosRun               (when running)
fetchTodosSuccess           (on success)
fetchTodosError             (on error)
```

---

## Best Practices

### ✅ Do

- **Use broadcast** for cross-cutting concerns (logging, analytics, UI updates)
- **Use targeted** for specific entity updates (loading a particular list)
- **Use manual update** for game loops or high-frequency updates
- **Keep handlers pure** - no side effects except state mutation
- **Use api.notify()** for event chaining - it maintains queue order

### ❌ Don't

- **Don't mutate state outside handlers** - always use events
- **Don't call notify() without awaiting in async** - queue won't wait
- **Don't directly access other entities** in handlers - use api.getEntity()
- **Don't assume handler order** - broadcast order is undefined
- **Don't create circular event chains** - can cause infinite loops

---

## Advanced: Custom Event Routing

You can implement custom event routing by extending the store behavior:

```javascript
const store = createStore({
  types,
  entities,
  systems: [
    {
      myCustomEvent(state, prevState, event) {
        // Run custom logic after all handlers
        console.log(`Event ${event.type} processed`)
        console.log(`State changed:`, state !== prevState)
      },
    },
  ],
})
```

---

## Comparison with Redux

| Aspect           | Redux                        | Inglorious             |
| ---------------- | ---------------------------- | ---------------------- |
| **Broadcasting** | All reducers see all actions | Selective handlers     |
| **Targeting**    | ❌ Not supported             | ✅ By type/ID/both     |
| **Queue**        | Implicit                     | Explicit, controllable |
| **Batching**     | Automatic                    | Auto or manual         |
| **Async**        | Thunks + middleware          | Native, queue-aware    |

---

## Next Steps

- **[Core Concepts](/guide/core-concepts)** - Entities and types
- **[Async Operations](/advanced/async-operations)** - Deep dive into async handlers
- **[Testing](/advanced/testing)** - Test event handlers
