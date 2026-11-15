---
title: Systems
description: Learn how to use systems for global logic in Inglorious Store.
---

# Systems

When you need to coordinate updates across multiple entities (not just respond to individual events), use systems. Systems run after all entity handlers for the same event, ensuring global consistency, and have write access to the entire state.

```javascript
export const systems = [
  {
    taskCompleted(entities, taskId, api) {
      // Read from every todo list, as the previous event left them
      const allTodos = api.getEntities("TodoList").flatMap((list) => list.todos)

      // Write to one entity
      entities.stats.total = allTodos.length
      entities.stats.completed = allTodos.filter((t) => t.isDone).length
    },
  },
]

const store = createStore({ types, entities, systems })
```

A system receives every entity, the payload and the api, and can write to any entity. It is for logic that needs all entities together: a game's clock, collision detection, derived totals. For a concern that wraps one type, such as a guard or logging, compose a [behavior](../guide/core-concepts.md#composition) instead; for what sits around the store, such as the DevTools, a [middleware](../api/reference.md#middlewares-optional).

Under `copy-on-dispatch`, each entity a system reads through its first argument is copied in case it is written to: a system that only needs to look reads from `api.getEntities()`.
