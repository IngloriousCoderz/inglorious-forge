# @inglorious/vite-plugin-vue

Transform Vue-like template syntax into lit-html templates for @inglorious/web.

## Installation

```bash
npm install @inglorious/vite-plugin-vue
```

---

## Setup

In your `vite.config.js`:

```javascript
import { defineConfig } from "vite"
import { vue } from "@inglorious/vite-plugin-vue"

export default defineConfig({
  plugins: [vue()],
})
```

---

## Usage

Create `.vue` files with `<template>` and optional `<script>` sections:

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

This compiles to a standard @inglorious/web component:

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

---

## Syntax: Vue vs lit-html

### Interpolation

**Vue:**

```html
<p>Hello {{ name }}!</p>
<p>Result: {{ x + y }}</p>
```

**lit-html:**

```javascript
html`
  <p>Hello ${entity.name}!</p>
  <p>Result: ${entity.x + entity.y}</p>
`
```

### Property Binding

**Vue:**

```html
<input :value="text" :disabled="isLoading" />
<div :class="activeClass"></div>
```

**lit-html:**

```javascript
html`
  <input .value=${entity.text} .disabled=${entity.isLoading} />
  <div class=${entity.activeClass}></div>
`
```

> **Note:** `class`, `id`, and kebab-case attributes use regular binding. CamelCase properties use `.property` syntax.

### Event Handlers

**Vue:**

```html
<button @click="handleClick">Click</button> <input @input="handleInput" />
```

**lit-html:**

```javascript
html`
  <button @click=${() => api.notify(`#${entity.id}:handleClick`)}>Click</button>
  <input @input=${() => api.notify(`#${entity.id}:handleInput`)} />
`
```

> **Note:** Method names are automatically wrapped with `api.notify()`. For inline handlers or parameters, use arrow functions: `@click="(e) => customHandler(entity, e)"`

### Conditionals

**Vue:**

```html
<div v-if="isLoading">Loading...</div>
<div v-else-if="hasError">Error</div>
<div v-else>Success</div>
```

**lit-html:**

```javascript
import { when } from "@inglorious/web"

html`
  ${when(
    entity.isLoading,
    () => html`<div>Loading...</div>`,
    () =>
      when(
        entity.hasError,
        () => html`<div>Error</div>`,
        () => html`<div>Success</div>`,
      ),
  )}
`
```

### Lists

**Vue:**

```html
<ul>
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>
</ul>
```

**lit-html:**

```javascript
import { repeat } from "@inglorious/web"

html`
  <ul>
    ${repeat(
      entity.items,
      (item) => item.id,
      (item) => html`<li>${item.name}</li>`,
    )}
  </ul>
`
```

---

## Component Structure

Vue files compile to standard @inglorious/web components:

### Script Section Parsing

The plugin analyzes your `<script>` section to separate:

- **State variables**: `const/let` declarations with primitive values → `create(entity)` method
- **Methods**: `const/let` with function values → methods on the type

```vue
<script>
// State variables
const count = 0
const items = []

// Methods
const increment = (entity) => entity.count++
const addItem = (entity, item) => entity.items.push(item)
</script>
```

Compiles to:

```javascript
export const component = {
  // State initialization
  create(entity) {
    entity.count = 0
    entity.items = []
  },

  // Methods become event handlers
  increment(entity) {
    entity.count++
  },

  addItem(entity, item) {
    entity.items.push(item)
  },

  // Template becomes render
  render(entity, api) {
    return html`...`
  },
}
```

### Event Handler Transformation

- **Method references** (`@click="increment"`) → `api.notify(\`#${entity.id}:increment\`)`
- **Inline expressions** (`@click="(e) => handler(entity, e)"`) → passed through as-is

### Template Interpolation

- **In templates**: Just use the variable name: `{{ count }}`
- **Compiled output**: Automatically prefixed: `${entity.count}`
- **In v-for loops**: Loop variables are NOT prefixed: `{{ item.name }}` → `${item.name}`

---

## TypeScript Support

Use `lang="ts"` in the script section:

```vue
<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
interface Props {
  initialMessage: string
}

const message: string = "Hello"

export default {
  message,
}
</script>
```

---

## Examples

### Counter

```vue
<template>
  <div class="counter">
    <h2>Count: {{ count }}</h2>
    <button @click="increment" :disabled="count >= 10">+</button>
    <button @click="decrement" :disabled="count <= 0">-</button>
    <button @click="reset" v-if="count > 0">Reset</button>
  </div>
</template>

<script>
const count = 0

const increment = (entity) => entity.count++
const decrement = (entity) => entity.count--
const reset = (entity) => (entity.count = 0)
</script>
```

### Todo List

```vue
<template>
  <div class="todos">
    <ul v-if="todos.length > 0">
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
    <p v-else>No todos yet!</p>
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

### Form Handling

```vue
<template>
  <form @submit="handleSubmit">
    <input
      type="email"
      :value="email"
      @input="(e) => updateEmail(entity, e)"
      :class="error ? 'error' : ''"
    />
    <span v-if="error">{{ error }}</span>
    <button type="submit" :disabled="!isValid(entity)">Submit</button>
  </form>
</template>

<script>
const email = ""
const error = ""

const updateEmail = (entity, e) => {
  entity.email = e.target.value
  entity.error = ""
}

const isValid = (entity) => {
  return entity.email.includes("@") && entity.email.length > 5
}

const handleSubmit = (entity, e) => {
  e.preventDefault()
  if (!isValid(entity)) {
    entity.error = "Invalid email"
    return
  }
  console.log("Submitted:", entity.email)
}
</script>
```

---

## Why Vue Syntax?

Vue templates offer:

- **Familiar directives** (`v-if`, `v-for`) instead of function calls
- **Cleaner interpolation** (`{{ }}` vs `${}`)
- **Explicit binding syntax** (`:prop`, `@event`)
- **Separation of template and logic**

All while compiling to the same efficient lit-html output!

## License

MIT
