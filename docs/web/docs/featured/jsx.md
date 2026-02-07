---
title: JSX Support
description: Use JSX syntax with Inglorious Web templates
---

# JSX Support

Write Inglorious Web components using JSX syntax with the `@inglorious/vite-plugin-jsx` plugin.

## Installation

```bash
npm install -D @inglorious/vite-plugin-jsx
```

## Vite Configuration

Add the plugin to your `vite.config.js`:

```javascript
import { defineConfig } from "vite"
import { jsx } from "@inglorious/vite-plugin-jsx"

export default defineConfig({
  plugins: [jsx()],
})
```

## Writing with JSX

Instead of template literals:

```javascript
// Without JSX (lit-html)
const counter = {
  render(entity, api) {
    return html`
      <div class="counter">
        <span>Count: ${entity.value}</span>
        <button @click=${() => api.notify("#counter:increment")}>+1</button>
      </div>
    `
  },
}

// With JSX
const counter = {
  render(entity, api) {
    return (
      <div className="counter">
        <span>Count: {entity.value}</span>
        <button onClick={() => api.notify("#counter:increment")}>+1</button>
      </div>
    )
  },
}
```

## JSX Features

### Interpolation

```jsx
<h1>Hello, {entity.name}!</h1>
<span>{entity.count * 2}</span>
```

### Conditionals

```jsx
{
  entity.isLoggedIn ? <p>Welcome back!</p> : <p>Please log in</p>
}
```

### Lists

```jsx
<ul>
  {entity.items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

### Event Handlers

```jsx
<button onClick={() => api.notify('#counter:increment')}>+1</button>

<input
  value={entity.name}
  onInput={(e) => api.notify('#form:setName', e.target.value)}
/>
```

### Classes and Styles

```jsx
<div className={entity.isActive ? 'active' : ''}>Active</div>

<div style={{ color: entity.color, fontSize: '16px' }}>Styled</div>
```

## Benefits

✅ **Familiar Syntax** — If you know React JSX, you'll recognize this  
✅ **No Runtime** — Compiles to optimized lit-html at build time  
✅ **Small Bundle** — No JSX runtime or transformation at runtime  
✅ **Full lit-html Power** — Use directives and all lit-html features

## When to Use

- **Familiar with React** — Easier transition to Inglorious
- **Team prefers HTML-like syntax** — More readable than template strings for some
- **Existing projects use JSX** — Consistency with rest of codebase

## When Not to Use

- **Prefer pure JavaScript** — Template strings are more transparent
- **Want zero build step** — Requires Vite compilation
- **Team unfamiliar with JSX** — Template literals are simpler to learn

**[Full JSX Plugin Documentation](https://npmjs.com/@inglorious/vite-plugin-jsx)**
