---
title: Systems
description: Learn how to use systems for global logic in Inglorious Store.
---

# Systems

When you need to coordinate updates across multiple entities (not just respond to individual events), use systems. Systems run after all entity handlers for the same event, ensuring global consistency, and have write access to the entire state.

```javascript
export const systems = [
  {
    taskCompleted(state, taskId) {
      // Read from multiple todo lists
      const allTodos = Object.values(state)
        .filter((e) => e.type === "todoList")
        .flatMap((e) => e.todos)

      // Update global stats
      state.stats.total = allTodos.length
      state.stats.completed = allTodos.filter((t) => t.completed).length
    },
  },
]

const store = createStore({ types, entities, systems })
```

Systems receive the entire state and can modify any entity. They're useful for cross-cutting concerns, maintaining derived state, or coordinating complex state updates that can't be expressed as individual entity handlers.
