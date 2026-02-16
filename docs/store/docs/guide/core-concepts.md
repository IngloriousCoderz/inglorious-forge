---
title: Core Concepts
description: Learn about entities, types, and event handlers in Inglorious Store.
---

# Core Concepts

## 🎮 Entities and Types

State consists of **entities** (instances) that have a **type** (behavior definition). Think of a type as a class and entities as instances:

```javascript
const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, completed: false })
    },
    toggle(entity, id) {
      const todo = entity.todos.find((t) => t.id === id)
      if (todo) todo.completed = !todo.completed
    },
  },
}

const entities = {
  workTodos: { type: "todoList", todos: [] },
  personalTodos: { type: "todoList", todos: [] },
}
```

**Why this matters:**

- Same behavior applies to all instances of that type.
- No need to write separate code for each instance.
- Your mental model matches your code structure.

### Entities vs. Redux State

**Redux:** State is typically a single flat or nested object. To manage multiple instances, you manually reshape state:

```javascript
// Redux approach
const initialState = {
  work: { todos: [] },
  personal: { todos: [] },
}
```

**Inglorious:** Entities are first-class citizens. Add instances without code changes:

```javascript
// Inglorious approach
const entities = {
  work: { type: "todoList", todos: [] },
  personal: { type: "todoList", todos: [] },
}

// Add a new list at runtime
store.notify("add", { id: "project", type: "todoList", todos: [] })
// It's already part of the state with its own behavior!
```

---

## 🔄 Event Handlers

Event handlers are similar to Redux reducers but with key differences:

### 1. Direct Entity Mutation

Inglorious Store uses **Mutative** (10x faster than Immer) under the hood for immutability. You can mutate entities directly:

```javascript
const types = {
  counter: {
    increment(counter) {
      counter.value++ // Looks like mutation, immutable in reality
    },
    add(counter, amount) {
      counter.value += amount
    },
  },
}

// vs Redux approach
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case "INCREMENT":
      return state + 1
    // ...
  }
}
```

### 2. Handler Signature

Event handlers receive up to three arguments:

```javascript
const types = {
  todoList: {
    // 1. Just the entity
    refresh(entity) {
      entity.lastUpdated = Date.now()
    },

    // 2. Entity + payload
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, done: false })
    },

    // 3. Entity + payload + API
    async fetchTodos(entity, userId, api) {
      entity.loading = true
      const todos = await fetch(`/api/users/${userId}/todos`).then((r) =>
        r.json(),
      )
      api.notify("todosLoaded", todos)
    },
  },
}
```

### 3. The API Object

The third argument (`api`) gives you powerful store operations:

```javascript
const types = {
  notification: {
    show(entity, message, api) {
      entity.message = message
      entity.visible = true

      // Read entire state
      const allEntities = api.getEntities()
      const allNotifications = api.getEntities("notification")

      // Read specific entity
      const user = api.getEntity("user")

      // Trigger other events (queued together)
      api.notify("analytics:log", { type: "showNotification" })
      api.notify("remove", { id: entity.id }) // Remove after 3s? Use setTimeout

      // Access type definitions (advanced)
      const typeDef = api.getType("todoList")

      // For edge cases, use Redux-style dispatch
      api.dispatch({ type: "custom", payload: {} })
    },
  },
}
```

---

## 🔊 Event Broadcasting

Events are broadcast to all entities via **pub/sub**. Every entity handler receives every event of that type.

```javascript
const types = {
  todoList: {
    taskCompleted(entity, taskId) {
      const task = entity.tasks.find((t) => t.id === taskId)
      if (task) task.completed = true
    },
  },
  stats: {
    taskCompleted(entity, taskId) {
      // This also runs when taskCompleted is triggered!
      entity.completedCount++
    },
  },
}

// One notify call, both handlers run
store.notify("taskCompleted", "task123")
// Result: task marked as complete + stats updated
```

### Targeted Notifications

You can narrow down which entities receive an event:

```javascript
// Notify only the entity with ID 'work'
store.notify("#work:taskCompleted", "task123")

// Notify only entities of type 'stats'
store.notify("stats:taskCompleted", "task123")

// Notify a specific entity of a specific type
store.notify("todoList#work:taskCompleted", "task123")
```

**Use case:** When only one instance should react to an event.

```javascript
const types = {
  todoList: {
    taskCompleted(entity, taskId) {
      // Only process if this is our task
      if (!entity.tasks.find((t) => t.id === taskId)) return

      const task = entity.tasks.find((t) => t.id === taskId)
      if (task) task.completed = true
    },
  },
}

// Only the list containing this task will update
store.notify("taskCompleted", "task123")

// Or target it more explicitly
store.notify("#workTodos:taskCompleted", "task123")
```

---

## 🔗 Behavior Composition

Types can combine multiple behaviors (like mixins or traits):

```javascript
// Single behavior
const counter = {
  increment(counter) {
    counter.value++
  },
}

// Compose behaviors
const resettableCounter = [
  counter, // Include all counter handlers
  {
    reset(counter) {
      counter.value = 0
    },
  },
]

const types = {
  myCounter: resettableCounter, // Works!
}
```

### Decorator Pattern

Wrap and enhance behaviors:

```javascript
// Base behavior
const resettable = {
  submit(entity, value) {
    entity.value = value
  },
}

// Wrapping function (decorator)
const validated = (behavior) => ({
  submit(entity, value, api) {
    if (value < 0) {
      api.notify("validationError", "Value must be positive")
      return
    }
    // Call original behavior
    behavior.submit(entity, value)
  },
})

// Apply decorator
const form = [validated(resettable)]

// Or stack multiple decorators
const robustForm = [validated, withLogging, withAnalytics(resettable)]
```

---

## 🔄 Lifecycle Events

Inglorious Store provides built-in events for entity lifecycle:

### `create` Event

Triggered when a new entity is added via the `add` event. Only visible to the created entity (not broadcast):

```javascript
const types = {
  todoList: {
    create(entity) {
      // Initialize when created
      console.log(`Created list: ${entity.id}`)
      entity.createdAt = Date.now()
    },

    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text, done: false })
    },
  },
}

store.notify("add", {
  id: "work",
  type: "todoList",
  todos: [],
})
// create handler fires for entity 'work'
```

### `destroy` Event

Triggered when an entity is removed. Also only visible to the destroyed entity:

```javascript
const types = {
  file: {
    destroy(entity, payload, api) {
      // Cleanup when removed
      console.log(`Destroying file: ${entity.id}`)
      // Save to database, close connections, etc
    },
  },
}

store.notify("remove", { id: "tempFile" })
// destroy handler fires for 'tempFile'
```

---

## 🎮 Pub/Sub vs. Targeted Events

**Pub/Sub (Broadcast):**

```javascript
store.notify("taskCompleted", taskId)
// All entities with taskCompleted handler receive it
// Good for: Cross-cutting concerns, global reactions
```

**Targeted (Direct):**

```javascript
store.notify("#work:taskCompleted", taskId)
// Only entity 'work' receives it
// Good for: Specific instance updates, scoped logic
```

**Choice:** Depends on your intent. Pub/Sub is simpler; targeted is more explicit.

---

## Putting It Together

Here's a complete example combining concepts:

```javascript
const types = {
  todoList: {
    create(entity) {
      entity.createdAt = Date.now()
      entity.todos = entity.todos || []
    },

    addTodo(entity, text) {
      entity.todos.push({
        id: Date.now(),
        text,
        completed: false,
      })
    },

    toggle(entity, id) {
      const todo = entity.todos.find((t) => t.id === id)
      if (todo) todo.completed = !todo.completed
    },

    async sync(entity, api) {
      entity.syncing = true
      const saved = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(entity.todos),
      }).then((r) => r.json())

      api.notify("syncComplete", saved)
    },

    syncComplete(entity, data) {
      entity.todos = data
      entity.syncing = false
      entity.lastSync = Date.now()
    },
  },

  stats: {
    addTodo(entity) {
      // Reacts to every addTodo event
      entity.totalAdded++
    },

    toggle(entity) {
      // Reacts to every toggle event
      entity.totalToggled++
    },
  },
}

const entities = {
  work: { type: "todoList", todos: [] },
  personal: { type: "todoList", todos: [] },
  stats: { type: "stats", totalAdded: 0, totalToggled: 0 },
}

const store = createStore({ types, entities })

// Usage
store.notify("addTodo", "Buy groceries") // Fires in both lists!
store.notify("#work:addTodo", "Finish report") // Only work list
```

---

[Explore Async Operations →](/advanced/async-operations)

[Learn About Testing →](/advanced/testing)
