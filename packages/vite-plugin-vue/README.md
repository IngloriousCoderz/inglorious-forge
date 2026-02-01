# @inglorious/vite-plugin-vue

Transform Vue-like template syntax into lit-html templates for @inglorious/web.

## Installation

```bash
npm install @inglorious/vite-plugin-vue
```

## Setup

In your `vite.config.js`:

```javascript
import { defineConfig } from "vite"
import { vue } from "@inglorious/vite-plugin-vue"

export default defineConfig({
  plugins: [vue()],
})
```

## Usage

Create `.vue` files with `<template>` and optional `<script>` sections:

```vue
<template>
  <div class="counter">
    <h2>Count: {{ entity.count }}</h2>
    <button @click="increment">+</button>
  </div>
</template>

<script>
const increment = (entity) => {
  entity.count++
}

export default {
  create(entity) {
    entity.count = 0
  },
}
</script>
```

This compiles to a standard @inglorious/web component:

```javascript
import { html } from "@inglorious/web"

const increment = (entity) => {
  entity.count++
}

export default {
  create(entity) {
    entity.count = 0
  },
  render(entity, api) {
    return html`
      <div class="counter">
        <h2>Count: ${entity.count}</h2>
        <button @click=${() => increment(entity)}>+</button>
      </div>
    `
  },
}
```

## Syntax: Vue vs lit-html

### Interpolation

**Vue:**

```html
<p>Hello {{ entity.name }}!</p>
<p>Result: {{ entity.x + entity.y }}</p>
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
<input :value="entity.text" :disabled="entity.isLoading" />
<div :class="entity.activeClass"></div>
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
  <button @click=${() => handleClick(entity)}>Click</button>
  <input @input=${(e) => handleInput(entity, e)} />
`
```

### Conditionals

**Vue:**

```html
<div v-if="entity.isLoading">Loading...</div>
<div v-else-if="entity.hasError">Error</div>
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
  <li v-for="item in entity.items" :key="item.id">{{ item.name }}</li>
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

## Component Structure

Vue files compile to standard @inglorious/web components. The `<script>` section can export event handlers like `create()`, and helper functions. All state lives on the `entity`:

```javascript
export default {
  // Optional: Initialize entity state
  create(entity) {
    entity.someData = initialValue
  },

  // Optional: Other event handlers
  someMethod(entity) {
    /* ... */
  },

  // Auto-generated: render method receives (entity, api)
  render(entity, api) {
    return html`...`
  },
}
```

**Important:** The template has access to `entity` and can reference it like `{{ entity.count }}`. Event handlers should be functions that accept `entity` as a parameter.

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

## Examples

### Counter

```vue
<template>
  <div class="counter">
    <h2>Count: {{ entity.count }}</h2>
    <button @click="increment" :disabled="entity.count >= 10">+</button>
    <button @click="decrement" :disabled="entity.count <= 0">-</button>
    <button @click="reset" v-if="entity.count > 0">Reset</button>
  </div>
</template>

<script>
const increment = (entity) => entity.count++
const decrement = (entity) => entity.count--
const reset = (entity) => (entity.count = 0)

export default {
  create(entity) {
    entity.count = 0
  },
}
</script>
```

### Todo List

```vue
<template>
  <div class="todos">
    <ul v-if="entity.todos.length > 0">
      <li v-for="todo in entity.todos" :key="todo.id">
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
const toggle = (entity, id) => {
  const todo = entity.todos.find((t) => t.id === id)
  if (todo) todo.done = !todo.done
}

const remove = (entity, id) => {
  const index = entity.todos.findIndex((t) => t.id === id)
  if (index !== -1) entity.todos.splice(index, 1)
}

export default {
  create(entity) {
    entity.todos = []
  },
}
</script>
```

### Form Handling

```vue
<template>
  <form @submit="handleSubmit">
    <input
      type="email"
      :value="entity.email"
      @input="(e) => updateEmail(entity, e)"
      :class="entity.error ? 'error' : ''"
    />
    <span v-if="entity.error">{{ entity.error }}</span>
    <button type="submit" :disabled="!isValid(entity)">Submit</button>
  </form>
</template>

<script>
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

export default {
  create(entity) {
    entity.email = ""
    entity.error = ""
  },
}
</script>
```

## Why Vue Syntax?

Vue templates offer:

- **Familiar directives** (`v-if`, `v-for`) instead of function calls
- **Cleaner interpolation** (`{{ }}` vs `${}`)
- **Explicit binding syntax** (`:prop`, `@event`)
- **Separation of template and logic**

All while compiling to the same efficient lit-html output!

## License

MIT
