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
import { when } from "lit-html"

const user = {
  render(entity, api) {
    return when(
      entity.isLoggedIn,
      () => html`<p>Welcome, ${entity.name}!</p>`,
      () => html`<p><a href="/login">Please log in</a></p>`,
    )
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
        ${entity.todos.map((todo) => html` <li>${todo.title}</li> `)}
      </ul>
    `
  },
}
```

### Using repeat() for Performance

The `repeat()` directive helps lit-html track which item is which:

```javascript
import { repeat } from "lit-html"

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
      value="${entity.name}"
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
import { classMap } from 'lit-html'

render(entity, api) {
  return html`
    <div class=${classMap({
      'item': true,
      'active': entity.isActive,
      'disabled': entity.isDisabled,
    })}>
      Content
    </div>
  `
}
```

### Style Binding

```javascript
import { styleMap } from 'lit-html'

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

### Passing Context Through API

Since `api` is passed through the entire render tree, children can access parent state and trigger parent events:

```javascript
const parent = {
  render(entity, api) {
    return html` <div class="parent">${api.render("child")}</div> `
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

### Loading State

```javascript
const dataFetcher = {
  // Keep state updates before await, notify events after
  async fetchData(entity, api) {
    entity.isLoading = true
    entity.error = null

    try {
      const response = await fetch("/api/data")
      const data = await response.json()
      // After await, notify event instead of updating entity
      api.notify("#dataFetcher:loadSuccess", data)
    } catch (err) {
      // Notify error event
      api.notify("#dataFetcher:loadError", err.message)
    }
  },

  loadSuccess(entity, data) {
    entity.isLoading = false
    entity.data = data
    entity.error = null
  },

  loadError(entity, error) {
    entity.isLoading = false
    entity.error = error
    entity.data = null
  },

  render(entity, api) {
    if (entity.isLoading) {
      return html`<p>Loading...</p>`
    }

    if (entity.error) {
      return html`<p>Error: ${entity.error}</p>`
    }

    return html` <div>${entity.data.map((item) => html`<p>${item}</p>`)}</div> `
  },
}
```

## Advanced Patterns

### Memoization

```javascript
import { compute } from '@inglorious/store'

const expensiveComputation = compute(
  (items) => {
    // This runs only when items changes
    return items
      .filter(x => x > 0)
      .map(x => x * 2)
      .reduce((a, b) => a + b, 0)
  },
  [() => api.getEntity('list').items]
)

render(entity, api) {
  return html`<p>Total: ${expensiveComputation()}</p>`
}
```

### Ref Binding (for DOM Access)

```javascript
import { ref } from "lit-html"

const canvas = {
  setup(entity) {
    // Optional: setup hook (not part of render)
  },

  render(entity, api) {
    const canvasRef = ref()

    return html`
      <canvas
        ${canvasRef}
        @click=${() => {
          const ctx = canvasRef.value.getContext("2d")
          ctx.fillRect(0, 0, 100, 100)
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
          <sidebar>${api.render("sidebar")}</sidebar>
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

Each entity is independent but composed together through the `app` entity. Changes to any part re-render only that part (thanks to lit-html's diffing).

## Best Practices

✅ **Do:**

- Keep render pure (no side effects)
- Use `repeat()` for lists with keys
- Use `classMap` and `styleMap` for complex bindings
- Break large renders into multiple entities
- Cache expensive computations with `compute()`

❌ **Don't:**

- Make API calls in render
- Create new objects/arrays in render
- Manually manipulate the DOM
- Store state outside the entity
- Use refs unless absolutely necessary

## Next Steps

- **[Event System](./event-system.md)** — Master event triggering and targeting
- **[Type Composition](../advanced/type-composition.md)** — Advanced patterns
- **[Testing](../advanced/testing.md)** — How to test render methods

Happy rendering! 🎨
