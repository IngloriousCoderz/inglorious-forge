# @inglorious/vite-plugin-vue - Complete Reference

## Installation

```bash
npm install @inglorious/vite-plugin-vue
```

## Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite"
import vue from "@inglorious/vite-plugin-vue"

export default defineConfig({
  plugins: [vue()],
})
```

## Core Concept

Transform Vue-like template syntax into lit-html templates for @inglorious/web. Uses Vue template syntax but compiles to lit-html - **no Vue runtime or reactivity**.

**CRITICAL:** The plugin compiles template expressions and event handlers to use `api.notify()` automatically. Direct mutations in `<script>` are compiled to event handlers that update state through the store's immutability system. All state changes go through the store, ensuring reactivity.

## Template Syntax

### Interpolation

```vue
<template>
  <span>{{ count }}</span>
</template>
```

Compiles to: `${entity.count}`

### Property Binding

```vue
<template>
  <input :value="text" />
  <div :class="className"></div>
</template>
```

Compiles to: `.value=${entity.text}`

### Event Handling

```vue
<template>
  <button @click="increment">+1</button>
</template>
```

Compiles to: `api.notify(\`#${entity.id}:increment\`)`

### Conditionals

```vue
<template>
  <div v-if="isVisible">Shown</div>
  <div v-else>Hidden</div>
</template>
```

Compiles using `when()` helper.

### Lists

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

Compiles using `repeat()` function with key tracking.

## Script Section

### Variables → Entity State

```vue
<script>
let count = 0
let name = "World"
</script>
```

Generates `create()` method:

```javascript
create(entity) {
  entity.count = 0
  entity.name = "World"
}
```

### Functions → Methods

```vue
<script>
const increment = (entity, api) => {
  entity.count++ // Safe: mutation inside event handler uses store's immutability
}

const resetWithDefault = (entity, api) => {
  const defaultValue = api.select((state) => state.settings.defaultCount)
  entity.count = defaultValue
}
</script>
```

Becomes event handlers on the exported component. The plugin compiles `@click="increment"` to `api.notify(\`#${entity.id}:increment\`)`, ensuring state changes trigger re-renders.

**Rule:** Mutations inside functions are safe because they run within the store's event handler context. The store uses Mutative for immutability, so `entity.count++` creates a new immutable state automatically.

## Complete Example

### Counter Component

```vue
<!-- counter.vue -->
<template>
  <div class="counter">
    <span>Count: {{ count }}</span>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script>
let count = 0

const increment = (entity, api) => {
  entity.count++
}

const decrement = (entity, api) => {
  entity.count--
}
</script>
```

### Todo List

```vue
<!-- todoList.vue -->
<template>
  <div class="todo-list">
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" :checked="todo.done" @change="toggle" />
        <span>{{ todo.text }}</span>
        <button @click="remove">×</button>
      </li>
    </ul>
  </div>
</template>

<script>
let todos = []

const toggle = (entity, todoId, api) => {
  const todo = entity.todos.find((t) => t.id === todoId)
  if (todo) todo.done = !todo.done
}

const remove = (entity, todoId, api) => {
  entity.todos = entity.todos.filter((t) => t.id !== todoId)
}

const add = (entity, text, api) => {
  entity.todos.push({ id: Date.now(), text, done: false })
}
</script>
```

### Form with Validation

```vue
<!-- emailForm.vue -->
<template>
  <form @submit="handleSubmit">
    <input
      type="email"
      :value="email"
      @input="updateEmail"
      :class="{ error: emailError }"
    />
    <span v-if="emailError" class="error">{{ emailError }}</span>
    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>

<script>
let email = ""
let emailError = ""
let isValid = false

const updateEmail = (entity, event, api) => {
  entity.email = event.target.value
  validateEmail(entity)
}

const validateEmail = (entity) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(entity.email)) {
    entity.emailError = "Invalid email"
    entity.isValid = false
  } else {
    entity.emailError = ""
    entity.isValid = true
  }
}

const handleSubmit = (entity, event, api) => {
  event.preventDefault()
  if (entity.isValid) {
    api.notify("formSubmitted", { email: entity.email })
  }
}
</script>
```

## TypeScript Support

```vue
<!-- counter.vue -->
<template>
  <div>{{ count }}</div>
</template>

<script lang="ts">
interface CounterEntity {
  id: string
  type: string
  count: number
}

let count: number = 0

const increment = (entity: CounterEntity) => {
  entity.count++
}
</script>
```

## Output Format

All Vue components compile to:

```javascript
export const componentName = {
  create(entity) {
    // Initialize from script variables
  },
  methodName(entity, payload, api) {
    // From script functions
  },
  render(entity, api) {
    // Compiled from template
    return html`...`
  },
}
```

## Usage with Store

```javascript
import { createStore } from "@inglorious/web"
import { counter } from "./counter.vue"
import { todoList } from "./todoList.vue"

const types = { counter, todoList }

const entities = {
  myCounter: { type: "counter" },
  myTodos: { type: "todoList" },
}

export const store = createStore({ types, entities })
```

## Important Notes

1. **No Vue Runtime** - This is NOT Vue.js. No reactivity system, no Vue lifecycle hooks.
2. **Entity-based** - All state lives in entities, not component state.
3. **Handler Signature** - Functions are called with `(entity, payload, api)` but can be defined with fewer parameters if not needed (e.g., `increment(entity)` or `set(entity, value)`).
4. **Compiles to lit-html** - Output uses `html` tagged templates from lit-html.
5. **State Changes** - All mutations in functions are wrapped in the store's immutability system. The plugin ensures `@click="increment"` compiles to `api.notify()`, triggering proper re-renders.

## Common Pitfalls

### ❌ Wrong: Trying to use local variables for state

```vue
<script>
let count = 0 // This becomes entity.count, not a local variable
const increment = () => {
  count++ // Wrong - this won't work as expected
}
</script>
```

### ✅ Correct: Mutate entity in handlers

```vue
<script>
let count = 0 // Becomes entity.count in create()
const increment = (entity) => {
  entity.count++ // Correct - mutation in handler triggers re-render
}
</script>
```

### ❌ Wrong: Mutating outside handlers

```vue
<script>
let count = 0
// Wrong - mutation outside handler won't trigger re-render
count = 10
</script>
```

### ✅ Correct: Use handlers for all state changes

```vue
<script>
let count = 0
const setCount = (entity, value) => {
  entity.count = value // Correct - mutation in handler
}
</script>
```
