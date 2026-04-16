---
title: Auto Create Entities
description: Avoid boilerplate by automatically creating singleton entities
---

# Auto Create Entities

For web apps where most entities are singletons (like headers, modals, sidebars), you can avoid boilerplate with `autoCreateEntities`.

## Without Auto Create

Normally you define both types and entities:

```javascript
const types = {
  Header: {
    render(entity, api) {
      return html`<header>...</header>`
    },
  },
  Sidebar: {
    render(entity, api) {
      return html`<aside>...</aside>`
    },
  },
  Content: {
    render(entity, api) {
      return html`<main>...</main>`
    },
  },
}

// Must define every entity
const entities = {
  header: { type: "Header", title: "My App" },
  sidebar: { type: "Sidebar", items: [] },
  content: { type: "Content", text: "" },
}
```

## With Auto Create

Let the store create entities automatically:

```javascript
const types = {
  Header: {
    render(entity, api) {
      return html`<header>...</header>`
    },
  },
  Sidebar: {
    render(entity, api) {
      return html`<aside>...</aside>`
    },
  },
  Content: {
    render(entity, api) {
      return html`<main>...</main>`
    },
  },
}

// Entities created automatically with same id as type name
const store = createStore({
  types,
  // no entities object!
  autoCreateEntities: true,
})

// store now has:
// store.entities.header (auto-created)
// store.entities.sidebar (auto-created)
// store.entities.content (auto-created)
```

## Initializing Entity State

Use the `create()` lifecycle event:

```javascript
const Header = {
  create(entity) {
    // Runs when entity is first created
    entity.title = "My App"
    entity.isSticky = true
  },

  render(entity, api) {
    return html`<header class=${entity.isSticky ? "sticky" : ""}>
      <h1>${entity.title}</h1>
    </header>`
  },
}

const Sidebar = {
  create(entity) {
    entity.items = []
    entity.isOpen = false
  },

  render(entity, api) {
    return html`
      <aside class=${entity.isOpen ? "open" : ""}>
        <ul>
          ${entity.items.map((item) => html`<li>${item}</li>`)}
        </ul>
      </aside>
    `
  },
}

// Auto create entities with initialized state
const store = createStore({
  types: { Header, Sidebar },
  autoCreateEntities: true,
})
```

## When to Use

✅ **Use `autoCreateEntities` when:**

- Most entities are singletons (one per type)
- Types and entity IDs are the same
- You want minimal boilerplate
- Building component-like entities

❌ **Don't use when:**

- You have multiple entities of the same type
- Entity IDs differ from type names
- You need complex initialization
- You're managing a collection of items

## Mixed Approach

You can mix auto-create with manual entities:

```javascript
const store = createStore({
  types: { Header, Sidebar, TodoItem },
  entities: {
    // Manually created entities (multiple todos)
    todo1: { type: "TodoItem", title: "Buy milk" },
    todo2: { type: "TodoItem", title: "Walk dog" },
    // header and sidebar will be auto-created
  },
  autoCreateEntities: true,
})
```

## Example: TODO App

```javascript
import { createStore } from "@inglorious/store"
import { mount, html } from "@inglorious/web"

const types = {
  App: {
    render(entity, api) {
      return html`
        <div class="app">
          ${api.render("header")} ${api.render("todoForm")}
          ${api.render("todoList")}
        </div>
      `
    },
  },

  Header: {
    create(entity) {
      entity.title = "My Todos"
    },

    render(entity, api) {
      return html`<h1>${entity.title}</h1>`
    },
  },

  TodoForm: {
    create(entity) {
      entity.inputValue = ""
    },

    addTodo(entity, title, api) {
      if (title.trim()) {
        const todos = api.getEntity("todoList")
        const id = Date.now()
        todos.todos[id] = { id, title, completed: false }
        entity.inputValue = ""
      }
    },

    render(entity, api) {
      return html`
        <div class="form">
          <input
            type="text"
            placeholder="Add a todo..."
            value="${entity.inputValue}"
            @input=${(e) => {
              entity.inputValue = e.target.value
            }}
          />
          <button
            @click=${() => api.notify("#todoForm:addTodo", entity.inputValue)}
          >
            Add
          </button>
        </div>
      `
    },
  },

  TodoList: {
    create(entity) {
      entity.todos = {}
    },

    deleteTodo(entity, id) {
      delete entity.todos[id]
    },

    render(entity, api) {
      const items = Object.values(entity.todos)
      return html`
        <ul>
          ${items.map(
            (todo) => html`
              <li>
                ${todo.title}
                <button
                  @click=${() => api.notify("#todoList:deleteTodo", todo.id)}
                >
                  Delete
                </button>
              </li>
            `,
          )}
        </ul>
      `
    },
  },
}

const store = createStore({
  types,
  autoCreateEntities: true, // Auto-create all entities
})

mount(store, (api) => api.render("app"), document.getElementById("root"))
```

With `autoCreateEntities`, you don't need to define an `entities` object at all!

## Benefits

- **Less boilerplate** — No duplicate entity definitions
- **Clearer intent** — Entity ID matches type name
- **Initialization pattern** — Use `create()` for state setup
- **Scalability** — Works well for component-like entities

## Next Steps

- **[Type Composition](./type-composition.md)** — Combine with composition patterns
- **[Quick Start](../guide/quick-start.md)** — See it in action

Happy creating! 🚀
