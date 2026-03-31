---
title: Framework Comparison
description: Inglorious Web vs React, Vue, Solid, Svelte, Next.js, and Astro
---

# Comparison with Other Frameworks

How Inglorious Web stacks up against popular alternatives.

## vs React

| Feature               | React                   | Inglorious Web      |
| --------------------- | ----------------------- | ------------------- |
| **Concept**           | Component-based         | Entity-based        |
| **Rendering**         | Virtual DOM             | Full-tree re-render |
| **State**             | Component state + Redux | Single entity store |
| **Bundle Size**       | 60.4KB (gzipped)        | 15.4KB (gzipped)    |
| **Learning Curve**    | Medium                  | Low                 |
| **Hooks**             | Required                | Not needed          |
| **Testing**           | Complex (mount, act)    | Trivial (trigger)   |
| **Performance**       | Great for large apps    | Great for all apps  |
| **Signal Reactivity** | No                      | No (full-tree)      |
| **SSR/SSG**           | ✅ Yes                  | ✅ Yes (SSX)        |
| **Mobile**            | React Native            | Not native          |

### Example: Counter

**React:**

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**Inglorious Web:**

```javascript
const Counter = {
  create(entity) {
    entity.count = 0
  },

  increment(entity) {
    entity.count++
  },

  render(entity, api) {
    return html`
      <div>
        <p>${entity.count}</p>
        <button @click=${() => api.notify("#counter:increment")}>+</button>
      </div>
    `
  },
}
```

### When to Choose

**Choose React if:**

- Building very large enterprise apps
- Need React Native for mobile
- Ecosystem is important
- Team expertise is React

**Choose Inglorious Web if:**

- Want simplicity and small bundle
- Learning web development
- Building traditional HTML apps
- Testing speed matters
- Prefer full-tree rendering

## vs Vue

| Feature            | Vue                | Inglorious Web                 |
| ------------------ | ------------------ | ------------------------------ |
| **Concept**        | Component-based    | Entity-based                   |
| **Rendering**      | Virtual DOM        | Full-tree                      |
| **Reactivity**     | Signals (Vue 3)    | Immutable mutations            |
| **Bundle Size**    | 47.2KB (gzipped)   | 15.4KB (gzipped)               |
| **Learning Curve** | Low                | Very low                       |
| **Templates**      | Vue templates      | lit-html + optional Vue plugin |
| **Testing**        | Mount + assertions | Trigger + assertions           |
| **DevTools**       | Yes                | Yes (Redux DevTools)           |
| **TypeScript**     | ✅ Excellent       | ✅ Excellent                   |
| **SSR/SSG**        | ✅ Yes             | ✅ Yes (SSX)                   |

### Example: Form

**Vue:**

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" />
    <span v-if="errors.email">{{ errors.email }}</span>
    <button type="submit">Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return { email: "", errors: {} }
  },
  methods: {
    handleSubmit() {
      /* ... */
    },
  },
}
</script>
```

**Inglorious Web:**

```javascript
const Form = {
  async submit(entity, api) {
    entity.errors = validate(entity.values)
    if (!Object.keys(entity.errors).length) {
      // submit
    }
  },

  render(entity, api) {
    return html`
      <form @submit=${() => api.notify("#form:submit")}>
        <input
          value="${entity.values.email}"
          @input=${(e) => (entity.values.email = e.target.value)}
        />
        <span>${entity.errors.email || ""}</span>
        <button type="submit">Submit</button>
      </form>
    `
  },
}
```

### When to Choose

**Choose Vue if:**

- Like reactive/signal style
- Want template syntax
- Prefer component abstraction
- Need extensive ecosystem

**Choose Inglorious Web if:**

- Like imperative/mutation style
- Prefer JavaScript-only
- Want smaller bundle
- Building simpler apps
- Testing speed matters

## vs Solid

| Feature            | Solid           | Inglorious Web   |
| ------------------ | --------------- | ---------------- |
| **Concept**        | Signal-based    | Entity-based     |
| **Reactivity**     | Fine-grained    | Full-tree        |
| **Bundle Size**    | 8.5KB (gzipped) | 15.4KB (gzipped) |
| **Performance**    | Excellent       | Great            |
| **Learning Curve** | Medium          | Very low         |
| **JSX**            | Required        | Optional         |
| **Testing**        | Moderate        | Trivial          |
| **Signals**        | ✅ Yes          | ❌ No            |
| **Full-tree**      | ❌ No           | ✅ Yes           |

### Example: List

**Solid:**

```jsx
const [todos, setTodos] = createSignal([])

return (
  <ul>
    <For each={todos()}>{(todo) => <li>{todo.title}</li>}</For>
  </ul>
)
```

**Inglorious Web:**

```javascript
render(entity, api) {
  return html`
    <ul>
      ${repeat(entity.todos, (t) => t.id, (todo) =>
        html`<li>${todo.title}</li>`
      )}
    </ul>
  `
}
```

### When to Choose

**Choose Solid if:**

- Fine-grained reactivity is important
- Bundle size is critical
- Want JSX with signals
- Building very reactive UIs

**Choose Inglorious Web if:**

- Like full-tree simplicity
- Want smallest footprint with good performance
- Prefer mutation-based updates
- Testing speed is priority
- Learning new concepts

## vs Svelte

| Feature            | Svelte                            | Inglorious Web        |
| ------------------ | --------------------------------- | --------------------- |
| **Concept**        | Compiler-based components         | Entity-based          |
| **Syntax**         | Custom (Svelte)                   | JavaScript + lit-html |
| **Bundle Size**    | 15KB (gzipped)                    | 15.4KB (gzipped)      |
| **Learning Curve** | Medium                            | Very low              |
| **Compiler**       | Required                          | No                    |
| **Reactivity**     | Signals-like (labeled statements) | Full-tree             |
| **Scoped CSS**     | ✅ Built-in                       | ❌ Manual             |
| **Testing**        | Moderate                          | Trivial               |

### Example: Toggle

**Svelte:**

```svelte
<script>
  let isOpen = false
</script>

<button on:click={() => isOpen = !isOpen}>
  {isOpen ? 'Close' : 'Open'}
</button>
```

**Inglorious Web:**

```javascript
const Toggle = {
  toggle(entity) {
    entity.isOpen = !entity.isOpen
  },
  render(entity, api) {
    return html`
      <button @click=${() => api.notify("#toggle:toggle")}>
        ${entity.isOpen ? "Close" : "Open"}
      </button>
    `
  },
}
```

### When to Choose

**Choose Svelte if:**

- Want scoped CSS
- Like compiler-based approach
- Prefer Svelte syntax
- Want smallest bundle size

**Choose Inglorious Web if:**

- Prefer pure JavaScript
- No compiler complexity
- Want trivial testing
- Like entity-based architecture

## vs Next.js

| Feature            | Next.js        | Inglorious Web + SSX |
| ------------------ | -------------- | -------------------- |
| **Type**           | Meta-framework | Framework + SSX      |
| **Base**           | React          | Inglorious Web       |
| **Routing**        | File-based     | File-based           |
| **SSR/SSG**        | ✅ Yes         | ✅ Yes               |
| **API Routes**     | ✅ Yes         | ❌ No                |
| **Bundle Size**    | Large (React)  | Small                |
| **Learning Curve** | High           | Low                  |
| **Ecosystem**      | Huge           | Small                |
| **Testing**        | Complex        | Trivial              |

### When to Choose

**Choose Next.js if:**

- Building with React
- Need API routes
- Want large ecosystem
- Building large applications

**Choose Inglorious Web + SSX if:**

- Prefer simpler architecture
- Want smaller bundle
- Building static-heavy sites
- Testing speed matters
- Learning web development

## vs Astro

| Feature            | Astro                     | Inglorious Web + SSX     |
| ------------------ | ------------------------- | ------------------------ |
| **Type**           | Meta-framework            | Framework + SSX          |
| **JS Default**     | None (islands)            | Needed for interactivity |
| **Islands Arch**   | ✅ Yes                    | ❌ No                    |
| **Bundle Size**    | Tiny (default)            | Small                    |
| **Components**     | Many (React, Vue, Svelte) | Inglorious only          |
| **Learning Curve** | Medium                    | Low                      |
| **File Routing**   | ✅ Yes                    | ✅ Yes                   |

### When to Choose

**Choose Astro if:**

- Want islands architecture
- Love static-first approach
- Want framework flexibility
- Building content sites

**Choose Inglorious Web + SSX if:**

- Want single framework consistency
- Prefer entity-based patterns
- Building traditional web apps
- Want unified testing approach

## Comparison Table

All frameworks side-by-side:

| Metric             | Inglorious Web   | React            | Vue              | Svelte          | Solid           |
| ------------------ | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| Bundle (gzipped)   | 15.4KB           | 60.4KB           | 47.2KB           | 15KB            | 8.5KB           |
| Performance        | Excellent        | Great            | Great            | Excellent       | Excellent       |
| JSX                | Optional         | Yes              | Optional         | No              | Optional        |
| Batteries included | Yes              | No               | No               | Yes             | No              |
| Reactivity         | Full tree render | useState         | Refs             | Signals         | Signals         |
| State Management   | Built-in         | Multiple choices | Multiple choices | Built-in        | Built-in        |
| Learning Curve     | Very Low         | Medium           | Low              | Medium          | Medium          |
| Testing            | Easy             | Hard             | Medium           | Medium          | Medium          |
| Model              | Entity-based     | Component-based  | Component-based  | Component-based | Component-based |
| Job Market         | Tiny             | Huge             | Large            | Medium          | Small           |

## Philosophy Comparison

**React:** "Learn once, write anywhere" — Components are reusable, but need complex state management.

**Vue:** "Progressive enhancement" — Gradually adopt complexity as needed.

**Solid:** "Fine-grained reactivity" — Maximize performance through signal tracking.

**Svelte:** "Write less code" — Compiler handles boilerplate.

**Inglorious Web:** "Simplicity first" — Entity-based, full-tree rendering, no magic. Perfect for learning and small-to-medium apps.

## Migration Paths

### From React

- Change component props to entity properties
- Use `api.notify()` instead of `setState()`
- Replace component tree with entity renders
- Remove Redux/Zustand (single store now)
- Testing becomes much faster!

### From Vue

- Change templates to lit-html
- Use `api.notify()` instead of event emitters
- Replace components with entities
- Remove Vuex (single store now)

### From Solid

- Replace signals with mutable entities
- Use full-tree instead of fine-grained
- Remove effects (no needed)
- Single store instead of multiple atoms

## Choose Inglorious Web If You Want

✅ **Simplicity** — No signals, hooks, or complex patterns

✅ **Fast Testing** — Trigger events and assert state

✅ **Small Bundle** — 28KB for Web + Store + lit-html

✅ **Entity-Based** — Consistent entity-centric architecture

✅ **Full-Tree Rendering** — Predictable rendering flow

✅ **To Learn Web Dev** — All web fundamentals, no framework magic

✅ **Type Composition** — Extend behaviors without inheritance

## Next Steps

- **[Getting Started](./guide/getting-started.md)** — Try Inglorious Web
- **[Why Not Signals?](./guide/what-is.md)** — Learn about design philosophy
- **[Examples](https://github.com/ingloriousCoderz/inglorious-forge/tree/main/examples)** — See real apps

Still deciding? Try all of them in a simple project and see which feels best to you! 🚀
