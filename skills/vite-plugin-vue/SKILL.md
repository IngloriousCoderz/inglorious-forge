---
name: vite-plugin-vue
description: Writing Inglorious Web types as Vue-like single-file templates with @inglorious/vite-plugin-vue.
---

# @inglorious/vite-plugin-vue

```javascript
import { defineConfig } from "vite";
import { vue } from "@inglorious/vite-plugin-vue";

export default defineConfig({ plugins: [vue()] });
```

Compiles `.vue` files to Inglorious Web types named after the file (`counter.vue` → `Counter`), or the folder for `index.vue` (`job-list/index.vue` → `JobList`); no Vue runtime.

- `<script>` `const`/`let` values become `create(entity)` fields; function values become handlers `(entity, payload, api)`.
- `@click="method"` becomes `api.notify(#id:method)`; inline arrows pass through as-is.
- `{{ }}`, `:prop`, `v-if`/`v-else-if`/`v-else` (→ `when()`), `v-for` with `:key` (→ `repeat()`).

```vue
<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <input type="checkbox" :checked="todo.done" @change="() => toggle(entity, todo.id)" />
      {{ todo.text }}
    </li>
  </ul>
</template>

<script>
const todos = [];

const toggle = (entity, id) => {
  const todo = entity.todos.find((t) => t.id === id);
  if (todo) todo.done = !todo.done;
};
</script>
```
