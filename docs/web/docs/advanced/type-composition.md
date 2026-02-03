---
title: Type Composition
description: Extend behavior with composition patterns, guards, middleware, and interception
---

# Type Composition

Type composition is one of Inglorious Web's most powerful features. It enables elegant solutions to cross-cutting concerns without wrapper hell or HOCs.

## What is Type Composition?

Types can be defined as **arrays of behaviors** that wrap and extend each other:

```javascript
const types = {
  // Simple type
  counter: {
    increment(entity) {
      entity.count++
    },
    render(entity, api) {
      /* ... */
    },
  },

  // Composed type (array of behaviors)
  loggedCounter: [baseCounter, loggingBehavior, analyticsBehavior],
}
```

Each behavior in the array can:

1. **Intercept** events before they reach the next behavior
2. **Modify** entity state or payload
3. **Redirect** to different logic
4. **Pass through** to the wrapped behavior

## Basic Example: Logging

```javascript
// Base type
const counter = {
  increment(entity) {
    entity.count++
  },
  render(entity, api) {
    return html`<button>${entity.count}</button>`
  },
}

// Logging behavior
const logging = (type) => ({
  increment(entity, payload, api) {
    console.log(`Incrementing counter ${entity.id}`)
    // Call the wrapped type's handler
    type.increment(entity, payload, api)
    console.log(`New value: ${entity.count}`)
  },
})

// Compose
const types = {
  counter: [counter, logging],
}
```

When you dispatch `#counter:increment`:

1. Logging intercepts it, logs start
2. Calls `counter.increment`
3. Logs end

## Advanced Example: Route Guard

```javascript
// Base page type
const adminPage = {
  navigate(entity, route) {
    entity.currentRoute = route
  },
  render(entity, api) {
    return html`<h1>Admin Page</h1>`
  },
}

// Authentication guard
const requireAuth = (type) => ({
  navigate(entity, route, api) {
    const user = api.getEntity("user")

    if (!user.isLoggedIn) {
      // Prevent navigation, redirect instead
      api.notify("navigate", "/login", {
        redirectTo: route,
      })
      return // Don't call wrapped type
    }

    // User authenticated, allow navigation
    type.navigate(entity, route, api)
  },
})

// Authorization guard
const requireAdmin = (type) => ({
  navigate(entity, route, api) {
    const user = api.getEntity("user")

    if (user.role !== "admin") {
      api.notify("navigate", "/unauthorized")
      return
    }

    type.navigate(entity, route, api)
  },
})

// Compose guards
const types = {
  // Public page, no guards
  publicPage: page,

  // Authenticated page
  userProfile: [page, requireAuth],

  // Admin-only page
  adminPanel: [page, requireAuth, requireAdmin],
}
```

Guards execute in order:

1. `adminPanel` dispatch triggers `requireAuth` first
2. `requireAuth` checks login, passes to `requireAdmin`
3. `requireAdmin` checks role, passes to `page`
4. `page` actually handles navigation

## Pattern: Analytics

```javascript
const analytics = (type) => ({
  // Intercept all events
  "*": function (entity, payload, api) {
    // Track event
    track({
      entity: entity.type,
      event: this.constructor.name, // Event name
      timestamp: Date.now(),
    })

    // Call original handler
    type[arguments.callee.name]?.(entity, payload, api)
  },
})

const types = {
  trackedCounter: [counter, analytics],
}
```

## Pattern: Validation

```javascript
const validated = (type) => ({
  setEmail(entity, email, api) {
    // Validate before calling handler
    if (!email.includes("@")) {
      api.notify("validation:error", { field: "email" })
      return
    }

    type.setEmail(entity, email, api)
  },
})

const types = {
  form: [baseForm, validated],
}
```

## Pattern: State Snapshots

```javascript
const withSnapshots = (type) => ({
  // Before any event, save state
  snapshot(entity, payload, api) {
    if (!entity._history) entity._history = []
    entity._history.push(JSON.parse(JSON.stringify(entity)))

    // Call wrapped handler
    const handlerName = arguments.callee.name
    type[handlerName]?.(entity, payload, api)
  },

  undo(entity) {
    if (entity._history?.length > 0) {
      const previous = entity._history.pop()
      Object.assign(entity, previous)
    }
  },
})

const types = {
  undoableCounter: [counter, withSnapshots],
}
```

## Pattern: Debouncing

```javascript
const debounced = (type) => {
  const pending = {}

  return {
    saveData(entity, data, api) {
      // Cancel previous save
      if (pending[entity.id]) {
        clearTimeout(pending[entity.id])
      }

      // Debounce: wait 500ms before actually saving
      pending[entity.id] = setTimeout(() => {
        type.saveData(entity, data, api)
        delete pending[entity.id]
      }, 500)
    },
  }
}

const types = {
  autosaveForm: [form, debounced],
}
```

## Multiple Behaviors

Chain multiple behaviors:

```javascript
const types = {
  advancedForm: [form, logging, validation, analytics, debounced],
}
```

Execution order (for a `fieldChange` event):

1. `logging` logs start
2. `validation` validates
3. `analytics` tracks
4. `debounced` debounces
5. `form` (base type) executes
6. `debounced` finishes timeout setup
7. `analytics` completes tracking
8. `validation` logs result
9. `logging` logs end

## Partial Behavior

A behavior doesn't need to intercept all events:

```javascript
const logging = (type) => ({
  // Only intercept increment
  increment(entity, payload, api) {
    console.log("Incrementing")
    type.increment(entity, payload, api)
  },
  // All other events pass through unchanged
})
```

## Conditional Interception

```javascript
const requireMode = (type) => ({
  editTitle(entity, newTitle, api) {
    if (entity.mode !== "edit") {
      console.warn("Not in edit mode")
      return
    }

    type.editTitle(entity, newTitle, api)
  },
})
```

## Modifying Payload

```javascript
const sanitizer = (type) => ({
  setTitle(entity, title, api) {
    // Clean the payload before passing
    const clean = title.trim().replace(/[<>]/g, "")
    type.setTitle(entity, clean, api)
  },
})
```

## Benefits

✅ **No Wrapper Hell** — Array composition instead of nested HOCs  
✅ **Explicit Order** — Clear which behavior runs first  
✅ **Easy to Test** — Test each behavior independently  
✅ **Reusable** — Share behaviors across types  
✅ **Composable** — Mix and match as needed

## When to Use

- **Cross-cutting concerns** — Logging, analytics, validation
- **Route guards** — Auth, permissions, redirects
- **State patterns** — Snapshots, undo/redo, debouncing
- **Middleware** — Transform data, check preconditions

## When Not to Use

- **Simple modifications** — Just put in the base type
- **Type-specific logic** — Belongs in the type itself
- **One-off concerns** — Not worth abstracting

## Testing Composed Types

Test behaviors independently:

```javascript
import { trigger } from "@inglorious/web/test"

test("logging logs events", () => {
  const logged = []
  const logging = (type) => ({
    increment(entity, payload, api) {
      logged.push("increment")
      type.increment(entity, payload, api)
    },
  })

  const testType = [
    {
      increment(e) {
        e.count++
      },
    },
    logging,
  ]

  const { entity } = trigger(
    { count: 0 },
    testType.find((t) => t.increment).increment,
  )

  expect(logged).toContain("increment")
  expect(entity.count).toBe(1)
})
```

## Next Steps

- **[Testing](./testing.md)** — Comprehensive testing strategies
- **[Route Guards](../components/router.md)** — Use type composition for advanced routing
- **[Type Composition in Store](https://docs.inglorious.dev/store/advanced/type-composition)** — Full documentation in Store docs

Happy composing! 🎯
