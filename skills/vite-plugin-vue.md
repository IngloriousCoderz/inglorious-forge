# @inglorious/vite-plugin-vue - Complete Reference

## Installation

```bash
npm install @inglorious/vite-plugin-vue
```

## Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite"
import { vue } from "@inglorious/vite-plugin-vue"

export default defineConfig({
  plugins: [vue()],
})
```

## Core Concept

Transforms Vue-like templates into lit-html templates for @inglorious/web. There is **no Vue runtime** or Vue reactivity involved.

## Basic Usage

```vue
<template>
  <div class="counter">
    <h2>Count: {{ count }}</h2>
    <button @click="increment">+</button>
  </div>
</template>

<script>
const count = 0

const increment = (entity) => {
  entity.count++
}
</script>
```

Compiles to:

```javascript
import { html } from "@inglorious/web"

export const counter = {
  create(entity) {
    entity.count = 0
  },
  increment(entity) {
    entity.count++
  },
  render(entity, api) {
    return html`
      <div class="counter">
        <h2>Count: ${entity.count}</h2>
        <button @click=${() => api.notify(`#${entity.id}:increment`)}>+</button>
      </div>
    `
  },
}
```

## Template Syntax

### Interpolation

```vue
<template>
  <p>Hello {{ name }}!</p>
  <p>Result: {{ x + y }}</p>
</template>
```

### Property Binding

```vue
<template>
  <input :value="text" :disabled="isLoading" />
  <div :class="activeClass"></div>
</template>
```

### Event Handling

```vue
<template>
  <button @click="handleClick">Click</button>
  <input @input="handleInput" />
</template>
```

Method references compile to `api.notify(#id:event)`.
For inline handlers or passing values, use arrow functions:

```vue
<template>
  <button @click="() => remove(entity, item.id)">Remove</button>
</template>
```

### Conditionals

```vue
<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="hasError">Error</div>
  <div v-else>Success</div>
</template>
```

### Lists

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

Compiles to `repeat()` for keyed lists.

## Script Section Parsing

The plugin derives:

- **State variables**: `const/let` with values → `create(entity)`
- **Methods**: `const/let` with function values → handlers on the type

```vue
<script>
const count = 0
const items = []

const increment = (entity) => entity.count++
const addItem = (entity, item) => entity.items.push(item)
</script>
```

## Complete Example

```vue
<template>
  <div class="todo-list">
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input
          type="checkbox"
          :checked="todo.done"
          @change="() => toggle(entity, todo.id)"
        />
        <span>{{ todo.text }}</span>
        <button @click="() => remove(entity, todo.id)">×</button>
      </li>
    </ul>
  </div>
</template>

<script>
const todos = []

const toggle = (entity, id) => {
  const todo = entity.todos.find((t) => t.id === id)
  if (todo) todo.done = !todo.done
}

const remove = (entity, id) => {
  entity.todos = entity.todos.filter((t) => t.id !== id)
}
</script>
```

## Output Format

All `.vue` files compile to standard @inglorious/web components:

```javascript
export const componentName = {
  create(entity) {
    // Initialize from script variables
  },
  methodName(entity, payload, api) {
    // From script functions
  },
  render(entity, api) {
    return html`...`
  },
}
```

## Important Notes

1. **No Vue runtime** — templates compile to lit-html.
2. **Entity-based state** — all state lives in entities.
3. **Handlers receive `(entity, payload, api)`** (extra args optional).
4. **`@click="method"` becomes `api.notify(#id:method)`**.
5. **Inline handlers** are passed through as-is.
