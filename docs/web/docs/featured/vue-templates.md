---
title: Vue Template Support
description: Use Vue template syntax with Inglorious Web (no reactivity)
---

# Vue Templates

Write Inglorious Web components using Vue Single-File Component–style template syntax with `@inglorious/vite-plugin-vue`.

## Installation

```bash
npm install -D @inglorious/vite-plugin-vue
```

## Vite Configuration

Add the plugin to your `vite.config.js`:

```javascript
import { defineConfig } from "vite"
import { vue } from "@inglorious/vite-plugin-vue"

export default defineConfig({
  plugins: [vue()],
})
```

## Writing with Vue Templates

Instead of template literals:

```vue
<!-- Without Vue template syntax (lit-html) -->
<!-- const counter = {
  render(entity, api) {
    return html`...`
  }
} -->

<!-- With Vue template syntax -->
<template>
  <div class="counter">
    <span>Count: {{ value }}</span>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
const value = 0
const increment = (entity) => entity.value++
</script>
```

## Vue Template Features

### Interpolation

```vue
<template>
  <h1>{{ title }}</h1>
  <span>{{ count * 2 }}</span>
</template>
```

### Conditionals

```vue
<template>
  <div v-if="isLoggedIn">
    <p>Welcome back!</p>
  </div>
  <div v-else>
    <p>Please log in</p>
  </div>
</template>
```

### Loops

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

### Event Handlers

```vue
<template>
  <button @click="increment">+1</button>

  <input :value="name" @input="(e) => setName(e.target.value)" />
</template>
```

### Property Binding

```vue
<template>
  <div :class="{ active: isActive }">Active</div>

  <div :style="{ color: itemColor, fontSize: fontSize + 'px' }">Styled</div>
</template>
```

## Script Section

```vue
<script>
// Define state variables and methods
const title = "My App"
const count = 5

const increment = (entity) => {
  entity.count++
}
</script>

<script lang="ts">
// TypeScript also supported
const title: string = "My App"
const count: number = 5

interface Item {
  id: number
  name: string
}
</script>
```

## Important Notes

⚠️ **This is NOT Vue**

- No Vue reactivity (no proxies, refs, watchers)
- No Vue SFC compiler
- No Vue runtime
- Just Vue-like template syntax compiled to lit-html

✅ **What You Get**

- Familiar template syntax if migrating from Vue
- All the entity-based benefits of Inglorious Web
- Compile-time transformation (zero runtime cost)
- Direct output to optimized lit-html

## When to Use

✅ **Use if:**

- **Migrating from Vue** — Familiar template syntax
- **Team knows Vue** — Lower learning curve
- **Prefer HTML-like syntax** — Cleaner than template strings for some
- **Want familiar tooling** — Similar to SFCs in appearance

❌ **Don't use if:**

- **Prefer pure JavaScript** — Template literals are more transparent
- **Team doesn't know Vue** — Harder to learn than lit-html
- **Want zero build step** — Requires Vite compilation

**[Full Vue Plugin Documentation](https://npmjs.com/@inglorious/vite-plugin-vue)**
