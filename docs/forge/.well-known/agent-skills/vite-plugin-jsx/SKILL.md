---
name: vite-plugin-jsx
description: Writing Inglorious Web templates in JSX/TSX with @inglorious/vite-plugin-jsx.
---

# @inglorious/vite-plugin-jsx

```ts
import { defineConfig } from "vite";
import { jsx } from "@inglorious/vite-plugin-jsx";

export default defineConfig({ plugins: [jsx()] });
```

Compiles JSX into lit-html templates: no React runtime. `cond && <x/>` becomes `when()`, `.map()` with `key` becomes `repeat()`, `onClick` becomes `@click`, `className` becomes `class`.

```jsx
export const TodoList = {
  render(entity, api) {
    return (
      <ul>
        {entity.todos.map((todo) => (
          <li key={todo.id} onClick={() => api.notify(`#${entity.id}:select`, todo.id)}>
            {todo.text}
          </li>
        ))}
      </ul>
    );
  },
};
```

TypeScript: `"jsx": "preserve"`, `"jsxImportSource": null`.
