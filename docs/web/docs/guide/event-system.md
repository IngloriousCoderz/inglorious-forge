---
title: Event System
description: Complete guide to event dispatch, targeting, handlers, and patterns
---

# The Event System

Events are how Inglorious Web state changes happen. Understanding the event system is key to building apps.

## Event Dispatch

### Broadcast Events

Send an event to all entities:

```javascript
api.notify("refresh") // All entities listen for 'refresh'
```

### Targeted Events

Send an event to a specific entity:

```javascript
api.notify("#counter:increment") // Only 'counter' entity listens
```

### With Payload

Pass data with your event:

```javascript
api.notify("#user:setName", "Alice")
api.notify("#todo:update", { title: "Buy milk", completed: true })
api.dispatch({
  type: "#cart:addItem",
  payload: { itemId: 123, quantity: 5 },
})
```

## Event Targeting

Inglorious Web supports four levels of event targeting:

### 1. Global Broadcast

All entities can listen:

```javascript
// Dispatch
api.notify("appInitialized")

// Any type can handle it
const myType = {
  appInitialized(entity) {
    console.log("App is ready!")
  },
}
```

### 2. By Type

Target all entities of a specific type:

```javascript
// Dispatch
api.notify("todo:toggle")

// All todo entities listen
const todo = {
  toggle(entity) {
    entity.completed = !entity.completed
  },
}
```

### 3. By ID

Target a specific entity:

```javascript
// Dispatch
api.notify("#counter:increment")

// Only the counter entity with that ID listens
const counter = {
  increment(entity) {
    entity.value++
  },
}
```

### 4. Type#ID (Specific)

Most specific targeting:

```javascript
// Dispatch
api.notify("listItem#item1:itemSelected", { highlighted: true })

// Only that entity with that handler listens
const listItem = {
  itemSelected(entity, payload) {
    entity.highlighted = payload.highlighted
  },
}
```

## Event Handlers

### Handler Signature

```javascript
const myType = {
  someEvent(entity, payload, api) {
    // entity: The entity being updated
    // payload: Data passed with the event
    // api: Store API (for triggering more events)
  },
}
```

### Optional Parameters

You can omit unused parameters:

```javascript
const myType = {
  // Just entity
  doSomething(entity) {
    entity.count++
  },

  // Entity and payload
  updateValue(entity, newValue) {
    entity.value = newValue
  },

  // All three
  complexEvent(entity, payload, api) {
    entity.data = payload
    api.notify("dataUpdated")
  },
}
```

## Event Patterns

### Pattern 1: Toggle State

```javascript
const toggle = {
  toggle(entity) {
    entity.isOpen = !entity.isOpen
  },

  render(entity, api) {
    return html`
      <button @click=${() => api.notify("#toggle:toggle")}>
        ${entity.isOpen ? "Close" : "Open"}
      </button>
      ${entity.isOpen ? html`<p>Content is visible</p>` : ""}
    `
  },
}
```

### Pattern 2: Form Input

```javascript
const form = {
  setField(entity, { field, value }) {
    entity[field] = value
  },

  render(entity, api) {
    return html`
      <input
        type="text"
        value="${entity.name}"
        @input=${(e) =>
          api.notify("#form:setField", {
            field: "name",
            value: e.target.value,
          })}
      />
    `
  },
}
```

### Pattern 3: Async Operations

```javascript
const dataLoader = {
  async load(entity, api) {
    // Set loading BEFORE await
    entity.isLoading = true

    try {
      const response = await fetch("/api/data")
      const data = await response.json()
      // After await, dispatch new event with result
      api.notify("#dataLoader:loadSuccess", data)
    } catch (error) {
      // Dispatch error event
      api.notify("#dataLoader:loadError", error.message)
    }
  },

  // Handle success result
  loadSuccess(entity, data) {
    entity.isLoading = false
    entity.data = data
    entity.error = null
  },

  // Handle error result
  loadError(entity, error) {
    entity.isLoading = false
    entity.error = error
    entity.data = null
  },

  render(entity, api) {
    if (entity.isLoading) return html`<p>Loading...</p>`
    if (entity.error) return html`<p>Error: ${entity.error}</p>`
    return html`<pre>${JSON.stringify(entity.data)}</pre>`
  },
}
```

### Pattern 4: Cross-Entity Communication

Entities communicate through events:

```javascript
const cart = {
  addItem(entity, itemId, api) {
    entity.items.push(itemId)
    // Tell the store something happened
    api.notify("itemAdded", { itemId })
  },

  render(entity, api) {
    return html`
      <button @click=${() => api.notify("#cart:addItem", "item-123")}>
        Add to Cart
      </button>
    `
  },
}

const notification = {
  itemAdded(entity, payload) {
    entity.message = `Added ${payload.itemId} to cart`
  },

  render(entity, api) {
    return html`<p>${entity.message}</p>`
  },
}
```

## Lifecycle Events

### Create

Runs when an entity is first created:

```javascript
const user = {
  create(entity) {
    entity.createdAt = new Date()
    console.log(`User ${entity.id} created`)
  },

  render(entity, api) {
    return html`<p>Created at: ${entity.createdAt}</p>`
  },
}
```

### Destroy

Runs when an entity is removed:

```javascript
const modal = {
  destroy(entity) {
    console.log(`Modal ${entity.id} destroyed`)
    // Cleanup if needed
  },
}
```

## Event Queue

By default, Inglorious Web batches events into a queue for predictable, atomic updates. This means multiple events in quick succession are processed together.

### How It Works

```javascript
// These events are queued together
api.notify("#item:select", 1)
api.notify("#item:highlight", 1)
api.notify("#list:updateCount")

// All handlers execute, then re-render once
```

### Manual Update Control

For advanced use cases (like game loops or animations), you can control when updates happen:

```javascript
import { createStore } from "@inglorious/store"

const store = createStore({
  types: {
    /* ... */
  },
  entities: {
    /* ... */
  },
  updateMode: "manual", // Don't update automatically
})

// Now you call store.update() when you want
function gameLoop() {
  api.notify("#player:move", { x: 10, y: 20 })
  api.notify("#enemy:update")

  // Update happens here, re-renders once
  store.update()

  requestAnimationFrame(gameLoop)
}

gameLoop()
```

**Use cases for manual mode:**

- Game loops running at 60 FPS
- Animation loops
- Batching multiple operations
- Performance-critical scenarios

## Advanced: Custom Event Handling

### With Full Event Object

```javascript
const myType = {
  someEvent(entity, payload, api, meta) {
    // meta contains: { type, timestamp, source, ... }
    console.log(`Event at ${meta.timestamp}`)
  },
}
```

### Conditional Handling

```javascript
const form = {
  fieldChange(entity, { field, value }) {
    // Only update if valid
    if (value.length > 0) {
      entity[field] = value
    }
  },
}
```

### Event Delegation

```javascript
const list = {
  itemEvent(entity, { itemId, action }, api) {
    // Handle different actions for list items
    switch (action) {
      case "select":
        entity.selectedId = itemId
        break
      case "delete":
        delete entity.items[itemId]
        break
    }
  },
}
```

## Type Composition with Events

Type composition allows you to intercept and modify events:

```javascript
// Base type
const page = {
  navigate(entity, route) {
    entity.currentRoute = route
  },
}

// Guard behavior
const requireAuth = (type) => ({
  navigate(entity, route, api) {
    if (!isAuthenticated()) {
      api.notify("navigate", "/login")
      return // Don't call original handler
    }
    type.navigate(entity, route, api)
  },
})

// Compose
const types = {
  protectedPage: [page, requireAuth],
}
```

## Best Practices

✅ **Do:**

- Use targeted events (`#id:action`) for specific entities
- Pass payload as a single object for clarity
- Keep handlers pure (mutations only, no side effects)
- Use broadcast events for global concerns
- Queue related events together for atomic updates

❌ **Don't:**

- Create multiple event types for the same action
- Pass complex objects as payload without structure
- Make API calls in event handlers (use async handlers instead)
- Trigger events from render methods (except user interactions)
- Rely on event order for correctness

## Next Steps

- **[Entity Render Methods](./entity-renders.md)** — How to trigger events from templates
- **[Type Composition](../advanced/type-composition.md)** — Advanced event interception
- **[Performance](../advanced/performance.md)** — Event queuing and performance tips

Happy eventing! ⚡
