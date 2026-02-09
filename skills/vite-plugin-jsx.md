# @inglorious/vite-plugin-jsx - Complete Reference

## Installation

```bash
npm install -D @inglorious/vite-plugin-jsx
```

## Vite Configuration

```ts
import { defineConfig } from "vite"
import { jsx } from "@inglorious/vite-plugin-jsx"

export default defineConfig({
  plugins: [jsx()],
})
```

## Core Concept

Compiles JSX/TSX into `lit-html` templates for @inglorious/web. No React runtime, hooks, or lifecycle.

## Example

```jsx
function render(entity, api) {
  return (
    <div className="card">
      {entity.visible && <h2>{entity.title}</h2>}

      {entity.items.map((item) => (
        <p key={item.id} onClick={() => api.notify("select", item)}>
          {item.name}
        </p>
      ))}
    </div>
  )
}
```

Compiles to:

```js
function render(entity, api) {
  return html`
    <div class="card">
      ${when(entity.visible, () => html`<h2>${entity.title}</h2>`)}
      ${repeat(
        entity.items,
        (item) => item.id,
        (item) =>
          html`<p @click=${() => api.notify("select", item)}>${item.name}</p>`,
      )}
    </div>
  `
}
```

## Common Patterns

### Events

```jsx
export const button = {
  render(entity, api) {
    return (
      <button onClick={() => api.notify(`#${entity.id}:click`)}>
        {entity.label}
      </button>
    )
  },
}
```

### Lists

```jsx
export const todoList = {
  render(entity) {
    return (
      <ul>
        {entity.todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    )
  },
}
```

## TypeScript Notes

Use `jsx: "preserve"` in `tsconfig.json` and avoid automatic React imports.

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": null
  }
}
```
