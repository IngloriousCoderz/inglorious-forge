---
title: Entity Render Methods
description: Learn render method patterns, conditionals, lists, events, and async operations
---

# Entity Render Methods

The `render(entity, api)` method is where your entity describes how it should appear on the screen. Master this and you master Inglorious Web.

## The Render Method Signature

```typescript
render(entity: Entity, api: API): TemplateResult
```

**Parameters:**

- **`entity`** — The current state of this entity
- **`api`** — The store API (for triggering events, rendering children, reading state)

**Returns:** A `lit-html` template

## Basic Render

```javascript
const greeting = {
  render(entity, api) {
    return html`<h1>Hello, ${entity.name}!</h1>`
  },
}
```

That's it. The template gets re-rendered whenever state changes, and lit-html updates only the changed parts.

## Using the API

### Read Entity State

```javascript
render(entity, api) {
  // Current entity
  const myValue = entity.count

  // Other entities
  const user = api.getEntity('user')
  const allEntities = api.getEntities()

  return html`<div>${myValue} (user: ${user.name})</div>`
}
```

### Render Other Entities

```javascript
const page = {
  render(entity, api) {
    return html`
      <div class="page">
        <header>${api.render("header")}</header>
        <main>${api.render("content")}</main>
        <footer>${api.render("footer")}</footer>
      </div>
    `
  },
}
```

### Dispatch Events

```javascript
const button = {
  render(entity, api) {
    return html`
      <button @click=${() => api.notify("#button:clicked", { x: 100 })}>
        Click me
      </button>
    `
  },
}
```

## Conditional Rendering

### If/Else

```javascript
const user = {
  render(entity, api) {
    if (entity.isLoggedIn) {
      return html`<p>Welcome, ${entity.name}!</p>`
    } else {
      return html`<p><a href="/login">Please log in</a></p>`
    }
  },
}
```

### Using lit-html's when() Directive

```javascript
import { when } from "@inglorious/web"

const user = {
  render(entity, api) {
    return html`
      ${when(
        entity.isLoggedIn,
        () => html`<p>Welcome, ${entity.name}!</p>`,
        () => html`<p><a href="/login">Please log in</a></p>`,
      )}
    `
  },
}
```

## Rendering Lists

### Simple Map

```javascript
const todoList = {
  render(entity, api) {
    return html`
      <ul>
        ${entity.todos.map((todo) => html`<li>${todo.title}</li>`)}
      </ul>
    `
  },
}
```

### Using repeat() for Performance

The `repeat()` directive helps lit-html track which item is which:

```javascript
import { repeat } from "@inglorious/web"

const todoList = {
  render(entity, api) {
    return html`
      <ul>
        ${repeat(
          entity.todos,
          (todo) => todo.id, // Key function
          (todo, index) => html`
            <li @click=${() => api.notify("#todoList:toggle", todo.id)}>
              ${todo.title}
            </li>
          `,
        )}
      </ul>
    `
  },
}
```

This is especially important if your list items can be reordered or filtered.

## Event Handling

### Click Handlers

```javascript
render(entity, api) {
  return html`
    <button @click=${() => api.notify('#myEntity:clicked')}>
      Click me
    </button>
  `
}
```

### Input Events

```javascript
render(entity, api) {
  return html`
    <input
      type="text"
      .value=${entity.name}
      @input=${(e) => api.notify('#myEntity:setName', e.target.value)}
    />
  `
}
```

### Submit Events

```javascript
render(entity, api) {
  return html`
    <form @submit=${(e) => {
      e.preventDefault()
      api.notify('#myEntity:submitForm', new FormData(e.target))
    }}>
      <input type="text" name="email" />
      <button type="submit">Submit</button>
    </form>
  `
}
```

### Multiple Handlers

```javascript
render(entity, api) {
  return html`
    <button
      @click=${() => api.notify('#myEntity:save')}
      @mouseenter=${() => api.notify('#myEntity:hover')}
      @mouseleave=${() => api.notify('#myEntity:unhover')}
    >
      Save
    </button>
  `
}
```

## Attributes and Properties

### Class Binding

```javascript
import { classMap } from "@inglorious/web"

render(entity, api) {
  return html`
    <div class=${classMap({
      item: true,
      active: entity.isActive,
      disabled: entity.isDisabled,
    })}>
      Content
    </div>
  `
}
```

### Style Binding

```javascript
import { styleMap } from "@inglorious/web"

render(entity, api) {
  return html`
    <div style=${styleMap({
      color: entity.color,
      backgroundColor: entity.bgColor,
      fontSize: `${entity.fontSize}px`,
    })}>
      Styled content
    </div>
  `
}
```

### Property Binding

```javascript
render(entity, api) {
  return html`
    <input
      type="checkbox"
      .checked=${entity.isChecked}
      @change=${(e) => api.notify('#myEntity:toggleCheck', e.target.checked)}
    />
  `
}
```

Note the `.` prefix — it sets a property instead of an attribute.

## Nested Entity Rendering

### Parent-Child Pattern

```javascript
const parent = {
  render(entity, api) {
    return html`
      <div class="parent">
        <h1>${entity.title}</h1>
        ${entity.children.map((childId) => api.render(childId))}
      </div>
    `
  },
}

const child = {
  render(entity, api) {
    return html`
      <div class="child">
        <p>${entity.name}</p>
      </div>
    `
  },
}
```

### Accessing Other Entity State

Since `api` is passed through the entire render tree, entities can access other entity state and trigger events:

```javascript
const parent = {
  render(entity, api) {
    return html`<div class="parent">${api.render("child")}</div>`
  },
}

const child = {
  render(entity, api) {
    const parent = api.getEntity("parent")

    return html`
      <div class="child">
        <p>${parent.title}</p>
        <button @click=${() => api.notify("#parent:doSomething")}>
          Trigger parent event
        </button>
      </div>
    `
  },
}
```

## Async Operations

### Important: Entity Proxy Limitations

**Critical:** You cannot access the `entity` parameter after an `await` in async event handlers. The Mutative.js proxy is released by then, and attempting to read or write will fail.

```javascript
// ❌ WRONG - Don't access entity after await
async fetchData(entity, api) {
  entity.loading = true
  const data = await fetch('/api/data')
  entity.data = data  // ERROR: Proxy is gone!
}

// ✅ CORRECT - Only access entity before await
async fetchData(entity, api) {
  entity.loading = true
  const data = await fetch('/api/data')
  api.notify('#myEntity:setData', data)  // Use events after await
}

// ✅ CORRECT - Need dynamic entity ID? Store it before await
async fetchData(entity, api) {
  const entityId = entity.id
  entity.loading = true
  const data = await fetch('/api/data')
  api.notify(`#${entityId}:setData`, data)  // No problem!
}
```

### Using handleAsync (Recommended)

The `handleAsync` helper makes async operations safe and easy:

```javascript
import { handleAsync } from "@inglorious/web"

const myType = {
  ...handleAsync("fetch", {
    // All lifecycle hooks are optional except 'run'

    start(entity) {
      // Called before the async operation
      entity.isLoading = true
      entity.error = null
    },

    async run(payload, api) {
      // The actual async work - returns the result
      const response = await fetch(`/api/data/${payload.id}`)
      return response.json()
    },

    success(entity, result) {
      // Called with the resolved value
      entity.data = result
    },

    error(entity, error) {
      // Called if run() throws or rejects
      entity.error = error.message
    },

    finally(entity) {
      // Always called after success or error
      entity.isLoading = false
    },
  }),

  render(entity, api) {
    if (entity.isLoading) {
      return html`<p>Loading...</p>`
    }

    if (entity.error) {
      return html`<p>Error: ${entity.error}</p>`
    }

    return html`
      <div>
        <button @click=${() => api.notify("#myEntity:fetch", { id: 123 })}>
          Load Data
        </button>
        ${entity.data
          ? html`<pre>${JSON.stringify(entity.data, null, 2)}</pre>`
          : null}
      </div>
    `
  },
}
```

**How it works:**

1. Trigger with `api.notify("#myEntity:fetch", payload)`
2. `start(entity)` runs synchronously (entity proxy available)
3. `run(payload, api)` executes the async operation
4. `success(entity, result)` or `error(entity, error)` runs (entity proxy available again)
5. `finally(entity)` runs regardless of success/error

This pattern ensures you never touch the entity after an `await`.

### Manual Async Pattern (Alternative)

If you prefer not to use `handleAsync`, follow this pattern:

```javascript
const dataFetcher = {
  async fetchData(entity, payload, api) {
    // Synchronous state updates BEFORE await
    entity.isLoading = true
    entity.error = null

    try {
      const response = await fetch("/api/data")
      const data = await response.json()
      // AFTER await: use events, not entity
      api.notify("#dataFetcher:loadSuccess", data)
    } catch (err) {
      api.notify("#dataFetcher:loadError", err.message)
    } finally {
      api.notify("#dataFetcher:loadFinally")
    }
  },

  loadSuccess(entity, data) {
    entity.data = data
    entity.error = null
  },

  loadError(entity, error) {
    entity.error = error
    entity.data = null
  },

  loadFinally(entity) {
    entity.isLoading = false
  },

  render(entity, api) {
    if (entity.isLoading) {
      return html`<p>Loading...</p>`
    }

    if (entity.error) {
      return html`<p>Error: ${entity.error}</p>`
    }

    return html`<div>${entity.data?.map((item) => html`<p>${item}</p>`)}</div>`
  },
}
```

## Advanced Patterns

### Memoization with compute()

For expensive computations that should only run when dependencies change, use `compute()`:

```javascript
import { compute } from "@inglorious/web"

const dashboard = {
  render(entity, api) {
    // This computation only runs when entities.list.items changes
    const totalValue = compute(
      (items) => {
        console.log("Computing total...") // Only logs when items change
        return items
          .filter((x) => x.value > 0)
          .map((x) => x.value * 2)
          .reduce((a, b) => a + b, 0)
      },
      [() => api.getEntity("list").items],
    )

    return html`<p>Total: ${totalValue()}</p>`
  },
}
```

**How it works:**

- `compute()` takes a computation function and an array of dependency functions
- The computation only re-runs when the dependencies return different values (shallow comparison)
- Call the returned function with `()` to get the memoized value

**Common pattern with selectors:**

```javascript
// In your selectors file
import { compute } from "@inglorious/web"

export const totalValue = compute(
  (items) => {
    return items
      .filter((x) => x.value)
      .map((x) => x.value * 2)
      .reduce((a, b) => a + b)
  },
  [(entities) => entities.list.items],
)

// In your render
render(entity, api) {
  const total = api.select(totalValue)
  return html`<p>Total: ${total}</p>`
}
```

This pattern keeps your expensive computations from running on every render.

### Ref Binding (for DOM Access)

Use refs when you need direct DOM access (use sparingly):

```javascript
import { ref, createRef } from "@inglorious/web"

const canvas = {
  create(entity) {
    entity.canvasRef = createRef()
  },

  render(entity, api) {
    return html`
      <canvas
        ${ref(entity.canvasRef)}
        @click=${() => {
          const ctx = entity.canvasRef.value?.getContext("2d")
          if (ctx) {
            ctx.fillRect(0, 0, 100, 100)
          }
        }}
      ></canvas>
    `
  },
}
```

## Composition with Multiple Entities

For complex UIs, compose multiple entity renders:

```javascript
const types = {
  app: {
    render(entity, api) {
      return html`
        <div class="app">
          <nav>${api.render("navigation")}</nav>
          <aside>${api.render("sidebar")}</aside>
          <main>${api.render("content")}</main>
        </div>
      `
    },
  },

  navigation: {
    render(entity, api) {
      return html`<nav><!-- navigation content --></nav>`
    },
  },

  sidebar: {
    render(entity, api) {
      return html`<aside><!-- sidebar content --></aside>`
    },
  },

  content: {
    render(entity, api) {
      return html`<main><!-- main content --></main>`
    },
  },
}
```

Each entity is independent but composed together through the `app` entity. Changes to any part trigger a full re-render, but lit-html only updates the changed DOM nodes.

## Best Practices

✅ **Do:**

- Keep render pure (no side effects)
- Use `repeat()` for lists with keys
- Use `classMap` and `styleMap` for complex bindings
- Break large renders into multiple entities
- Use `handleAsync` for async operations
- Use `compute()` for expensive computations
- Use property binding (`.prop`) for properties, attribute binding for attributes
- Store entity ID in a variable before `await` if you need it after

❌ **Don't:**

- Make API calls in render
- Access `entity` after `await` in async handlers
- Create new objects/arrays in render without memoization
- Manually manipulate the DOM
- Store state outside the entity
- Use refs unless absolutely necessary

## Next Steps

- **[Event System](./event-system.md)** — Master event triggering and targeting
- **[Type Composition](../advanced/type-composition.md)** — Advanced patterns
- **[Testing](../advanced/testing.md)** — How to test render methods

Happy rendering! 🎨
