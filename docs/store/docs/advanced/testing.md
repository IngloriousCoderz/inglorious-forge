---
title: Testing
description: Learn how to test Inglorious Store event handlers and systems.
---

# Testing

Event handlers are pure functions (or can be treated as such), making them easy to test in isolation, much like Redux reducers. The `@inglorious/store/test` module provides utility functions to make this even simpler.

## `trigger(entity, handler, payload, api?)`

The `trigger` function executes an event handler on a single entity and returns the new state and any events that were dispatched.

```javascript
import { trigger } from "@inglorious/store/test"

// Define your entity handler
function increment(entity, payload, api) {
  entity.value += payload.amount
  if (entity.value > 100) {
    api.notify("overflow", { id: entity.id })
  }
}

// Test it
const { entity, events } = trigger(
  { type: "counter", id: "counter1", value: 99 },
  increment,
  { amount: 5 },
)

expect(entity.value).toBe(104)
expect(events).toEqual([{ type: "overflow", payload: { id: "counter1" } }])
```

## `createMockApi(entities)`

If your handler needs to interact with other entities via the `api`, you can create a mock API. This is useful for testing handlers that read from other parts of the state.

```javascript
import { createMockApi, trigger } from "@inglorious/store/test"

// Create a mock API with some initial entities
const api = createMockApi({
  counter1: { type: "counter", value: 10 },
  counter2: { type: "counter", value: 20 },
})

// A handler that copies a value from another entity
function copyValue(entity, payload, api) {
  const source = api.getEntity(payload.sourceId)
  entity.value = source.value
}

// Trigger the handler with the custom mock API
const { entity } = trigger(
  { type: "counter", id: "counter2", value: 20 },
  copyValue,
  { sourceId: "counter1" },
  api,
)

expect(entity.value).toBe(10)
```

The mock API provides:

- `getEntities()`: Returns all entities (frozen).
- `getEntity(id)`: Returns a specific entity by ID (frozen).
- `select(selector)`: Runs a selector against the entities.
- `dispatch(event)`: Records an event for later assertions.
- `notify(type, payload)`: A convenience wrapper around `dispatch`.
- `getEvents()`: Returns all events that were dispatched.
