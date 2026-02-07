---
title: Quick Start
description: Build a complete TODO app in 10 minutes with working code
---

# Quick Start

Build a complete Todo app in 10 minutes. This is a hands-on introduction to Inglorious Web.

## Project Setup

Create a new directory and initialize the project:

```bash
mkdir todo-app
cd todo-app
npm init -y
npm install @inglorious/web
```

Create `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Todo App</title>
    <style>
      body {
        font-family: sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
      }
      .todo-item {
        padding: 10px;
        margin: 5px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .todo-item.completed {
        background: #f0f0f0;
        text-decoration: line-through;
      }
      button {
        padding: 5px 10px;
        margin: 0 5px;
        cursor: pointer;
      }
      input {
        flex: 1;
        padding: 8px;
        font-size: 1rem;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

## Define Your Types

Create `main.js` with your entity types:

```javascript
import { createStore, mount, html } from "@inglorious/web"

// Define entity types
const types = {
  todoApp: {
    addTodo(entity, title) {
      if (title.trim()) {
        const id = Date.now()
        entity.todos[id] = { id, title, completed: false }
        entity.input = ""
      }
    },

    updateInput(entity, value) {
      entity.input = value
    },

    toggleTodo(entity, id) {
      entity.todos[id].completed = !entity.todos[id].completed
    },

    deleteTodo(entity, id) {
      delete entity.todos[id]
    },

    render(entity, api) {
      const todos = Object.values(entity.todos)
      const completed = todos.filter((t) => t.completed).length

      return html`
        <div class="todo-app">
          <h1>My Todos</h1>
          <p>${completed} of ${todos.length} completed</p>

          <div class="input-group">
            <input
              type="text"
              placeholder="Add a new todo..."
              value="${entity.input}"
              @input=${(e) =>
                api.notify("#todoApp:updateInput", e.target.value)}
              @keydown=${(e) => {
                if (e.key === "Enter") {
                  api.notify("#todoApp:addTodo", entity.input)
                }
              }}
            />
            <button
              @click=${() => api.notify("#todoApp:addTodo", entity.input)}
            >
              Add
            </button>
          </div>

          <ul class="todo-list">
            ${todos.map(
              (todo) => html`
                <li class="todo-item ${todo.completed ? "completed" : ""}">
                  <span>${todo.title}</span>
                  <div>
                    <button
                      @click=${() => api.notify("#todoApp:toggleTodo", todo.id)}
                    >
                      ${todo.completed ? "Undo" : "Done"}
                    </button>
                    <button
                      @click=${() => api.notify("#todoApp:deleteTodo", todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              `,
            )}
          </ul>
        </div>
      `
    },
  },
}

// Create store with initial state
const store = createStore({
  types,
  entities: {
    todoApp: {
      type: "todoApp",
      input: "",
      todos: {},
    },
  },
})

// Mount the app
mount(store, (api) => api.render("todoApp"), document.getElementById("root"))
```

## Run It

Start a simple HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node (with http-server package)
npx http-server

# Using Deno
deno run --allow-net https://deno.land/std/http/file_server.ts
```

Then visit `http://localhost:8000` and you have a working todo app! 🎉

## What Just Happened?

### 1. **Entity Type Definition**

```javascript
const types = {
  todoApp: {
    // Event handlers (mutate state)
    addTodo(entity, title) {
      /* ... */
    },
    toggleTodo(entity, id) {
      /* ... */
    },

    // Render method (returns template)
    render(entity, api) {
      /* ... */
    },
  },
}
```

### 2. **Store Creation**

```javascript
const store = createStore({
  types, // Type definitions
  entities: {
    todoApp: {
      // Entity with initial state
      type: "todoApp",
      input: "",
      todos: {},
    },
  },
})
```

### 3. **App Mounting**

```javascript
mount(store, (api) => api.render("todoApp"), document.getElementById("root"))
```

When state changes:

- Render function runs completely
- lit-html diffs the template
- Only changed DOM nodes update

## Extending the App

### Add Filtering

```javascript
const types = {
  todoApp: {
    // ... existing methods

    setFilter(entity, filter) {
      entity.filter = filter // 'all', 'active', 'completed'
    },

    render(entity, api) {
      // Filter todos based on current filter
      let todos = Object.values(entity.todos)
      if (entity.filter === "active") {
        todos = todos.filter((t) => !t.completed)
      } else if (entity.filter === "completed") {
        todos = todos.filter((t) => t.completed)
      }

      return html`
        <div>
          <!-- ... existing todo list ... -->

          <div class="filters">
            <button @click=${() => api.notify("#todoApp:setFilter", "all")}>
              All
            </button>
            <button @click=${() => api.notify("#todoApp:setFilter", "active")}>
              Active
            </button>
            <button
              @click=${() => api.notify("#todoApp:setFilter", "completed")}
            >
              Completed
            </button>
          </div>
        </div>
      `
    },
  },
}
```

### Add Persistence

```javascript
const types = {
  todoApp: {
    create(entity) {
      // Load from localStorage
      const saved = localStorage.getItem("todos")
      if (saved) {
        entity.todos = JSON.parse(saved)
      }
    },

    addTodo(entity, title) {
      // ... existing code ...
      // Save after mutation
      localStorage.setItem("todos", JSON.stringify(entity.todos))
    },

    // Other methods also save...
  },
}
```

## Key Patterns

### Pattern 1: Event Dispatch

```javascript
// Dispatch event from render
<button @click=${() => api.notify('#todoApp:addTodo', entity.input)}>
  Add
</button>

// Handler receives payload
addTodo(entity, payload) {
  entity.title = payload
}
```

### Pattern 2: Conditional Rendering

```javascript
render(entity, api) {
  if (entity.todos.length === 0) {
    return html`<p>No todos yet!</p>`
  }

  return html`<ul>${/* render todos */}</ul>`
}
```

### Pattern 3: Entity Composition

For larger apps, break into multiple entities:

```javascript
const types = {
  app: {
    render(entity, api) {
      return html`
        <div>
          ${api.render("header")} ${api.render("todoList")}
          ${api.render("footer")}
        </div>
      `
    },
  },
  header: {
    /* ... */
  },
  todoList: {
    /* ... */
  },
  footer: {
    /* ... */
  },
}
```

## Next Steps

- **[Core Concepts](./core-concepts.md)** — Deep dive into entities, types, and events
- **[Rendering Model](./rendering-model.md)** — Understand the full-tree rendering approach
- **[Event System](./event-system.md)** — Master event targeting and the event queue
- **[Featured Types](../featured/overview.md)** — Built-in form, table, router, ...
- **[Type Composition](../advanced/type-composition.md)** — Advanced patterns like guards and middleware

Happy building! 🚀
