---
title: Rendering Model
description: Understanding full-tree rendering, lit-html diffing, and performance characteristics
---

# The Rendering Model

Inglorious Web's rendering model is unique: **full-tree re-render with DOM diffing**. Understanding this is key to using the framework effectively.

## The Basic Loop

Every state change follows this cycle:

```
Event Dispatched
    ↓
Handler Executes
    ↓
Entity State Mutates
    ↓
Store Notifies Subscribers
    ↓
renderApp(api) Runs Completely
    ↓
lit-html Diffs Templates
    ↓
DOM Updates (Only Changed Parts)
    ↓
Browser Renders
```

Let's walk through an example:

```javascript
// 1. User clicks button
<button @click=${() => api.notify("#counter:increment")}>+</button>

// 2. Handler executes
counter.increment(entity) {
  entity.value++ // State mutates
}

// 3. Store notifies subscribers

// 4. renderApp(api) runs COMPLETELY
const renderApp = (api) => html`
  <div>
    <h1>Count: ${api.getEntity("counter").value}</h1>
    <button @click=${...}>+</button>
  </div>
`

// 5. lit-html diffs: "Oh, the h1 text changed. Update it."

// 6. DOM updates: Only the h1's text node is modified

// 7. Browser repaint of just that node
```

## Key Insight: Separation of Concerns

This model separates **template execution** from **DOM updates**:

| Phase              | Cost                       | Example                               |
| ------------------ | -------------------------- | ------------------------------------- |
| Template execution | Cheap (CPU)                | Run JavaScript, build template string |
| lit-html diffing   | Cheap (CPU)                | Compare old and new templates         |
| DOM updates        | Expensive (Reflow/Repaint) | Only changed nodes                    |
| Browser render     | Expensive                  | Pixel layout and paint                |

**Inglorious Web optimizes what matters:** It trusts lit-html to minimize DOM updates (the expensive part) while keeping templates simple and predictable (the cheap part).

## Why Full-Tree Re-render?

### ✅ Advantages

1. **Simplicity** — No dependency graph to maintain
2. **Predictability** — No surprise re-renders, no missing dependencies
3. **Debuggability** — Every state change is visible; Redux DevTools shows everything
4. **No memory leaks** — No subscriptions to clean up
5. **No missed updates** — Template always reflects current state

### ⚠️ Trade-offs

1. **Template execution runs fully** — Not as optimized as fine-grained frameworks
2. **Requires efficient template diffing** — That's why we use lit-html
3. **Overkill for tiny changes** — But still pretty fast in practice

## How lit-html Makes It Fast

### Template Caching

lit-html compiles templates once and caches them:

```javascript
// This template string is compiled ONCE
const template = html`<h1>${title}</h1>`

// Changes to `title` don't recompile, just update the expression
```

### Smart Diffing

lit-html is optimized for template strings, not VDOM:

```javascript
// Old
html`<h1>Count: 5</h1>
  <button>+</button>`

// New
html`<h1>Count: 6</h1>
  <button>+</button>`

// lit-html diffs: "h1 text changed, button unchanged"
// DOM updates: Only the h1 text node
```

### No Virtual DOM Overhead

Unlike React, there's no VDOM diff step:

| Framework  | Steps                                          | Overhead          |
| ---------- | ---------------------------------------------- | ----------------- |
| React      | 1. Template → VDOM 2. VDOM diff 3. DOM updates | High (full VDOM)  |
| Inglorious | 1. Template diff 2. DOM updates                | Low (string diff) |

## Performance in Practice

For typical UIs, full-tree re-renders are **fast enough**:

### Benchmarks

| Operation                           | Time                                     |
| ----------------------------------- | ---------------------------------------- |
| 100 entity type definitions         | ~1ms                                     |
| Full-tree render with 50 entities   | ~5ms                                     |
| lit-html diff of 100 template nodes | ~2ms                                     |
| DOM update (if changed)             | 1-10ms (depends on what changed)         |
| Total cycle                         | ~10-20ms (still under 16ms frame budget) |

Most of the time is spent in **DOM updates**, not template execution. So rendering the full template is negligible.

### Real-World Example

A typical app with:

- 50 entities (cards, rows, buttons, etc.)
- 200 DOM nodes
- Complex templating (loops, conditions)

Still renders in ~15ms, leaving 1ms for the frame budget. Good performance!

## When Full-Tree Re-render Might Be Slow

1. **Rendering 1000+ DOM nodes** — Use the `list` component (virtual scrolling)
2. **Extremely complex templates** — Simplify or break into smaller entities
3. **Expensive computations in render** — Move to event handlers or use `compute()` memoization

## Comparison with Other Frameworks

### React: Selective Re-render

React tries to re-render only what changed:

```javascript
// Only <Counter /> re-renders when count changes
<App>
  <Header /> {/* Skipped */}
  <Counter /> {/* Re-renders */}
  <Footer /> {/* Skipped */}
</App>
```

**Cost:** Complex reconciliation logic, Fiber scheduling, hooks dependency tracking

### Vue: Proxy-based Tracking

Vue tracks which properties changed via proxies:

```javascript
const state = reactive({ count: 0 })
// Change count → Vue tracks which components use it → re-render them
state.count++
```

**Cost:** Proxy overhead, dependency tracking complexity, edge cases with object mutation

### Solid: Fine-grained Signals

Solid only re-renders the exact expression that changed:

```javascript
// Only the <span> re-renders when count changes
<div>
  <h1>Always visible</h1> {/* Never re-renders */}
  <span>{count()}</span> {/* Re-renders */}
</div>
```

**Cost:** Steep learning curve, reactive graph complexity, fine-grained model is unintuitive

### Inglorious Web: Full-tree Diff

Inglorious renders everything but diffs at the template level:

```javascript
// Whole app re-renders
const renderApp = (api) => html`
  <div>
    <h1>Always visible</h1>
    <span>${api.getEntity("counter").value}</span>
  </div>
`

// lit-html diffs and updates only changed span
```

**Trade-off:** Simple model, predictable, negligible performance cost for typical UIs

## DOM Diffing Details

### What lit-html Tracks

lit-html is optimized for **template strings** (not VDOM):

```javascript
// Template 1
html`<button>${count}</button>`

// Template 2
html`<button>${count + 1}</button>`

// lit-html diffs:
// "static part: <button>, dynamic part: 5, static part: </button>"
// vs
// "static part: <button>, dynamic part: 6, static part: </button>"
// → Update the dynamic part in the DOM
```

### Unchanged Templates

If the template structure doesn't change, lit-html is extremely efficient:

```javascript
// This template is compiled once, cached
const static = html`<div class="card"><h2>${title}</h2></div>`

// Each render, only ${title} is checked
// If it's the same, nothing updates
```

### Directives for Advanced Cases

lit-html provides directives for tricky patterns:

```javascript
import { repeat, when, choose } from "lit-html"

// repeat: Preserves element identity by key
const list = repeat(
  items,
  (item) => item.id,
  (item) => html`<li>${item.name}</li>`,
)

// when: Conditional rendering
const conditional = when(
  isLoading,
  () => html`<p>Loading...</p>`,
  () => html`<p>Done!</p>`,
)

// choose: Switch-like rendering
const switcher = choose(status, [
  ["loading", () => html`<p>Loading...</p>`],
  ["done", () => html`<p>Done!</p>`],
  [() => true, () => html`<p>Unknown</p>`],
])
```

## Best Practices for Rendering

### 1. Keep Render Pure

```javascript
// ✅ Good: Pure function
render(entity, api) {
  return html`<div>${entity.title}</div>`
}

// ❌ Bad: Side effects
render(entity, api) {
  fetch('/api/data') // Avoid!
  return html`<div>${entity.title}</div>`
}
```

### 2. Use entity Composition for Complex UIs

```javascript
// ✅ Good: Multiple entities
const types = {
  app: {
    render(entity, api) {
      return html`
        <div>
          ${api.render("header")} ${api.render("content")}
          ${api.render("footer")}
        </div>
      `
    },
  },
  header: {
    /* ... */
  },
  content: {
    /* ... */
  },
  footer: {
    /* ... */
  },
}

// ❌ Avoid: Massive single entity
const types = {
  app: {
    render(entity, api) {
      return html`
        <header><!-- 100 lines --></header>
        <content><!-- 200 lines --></content>
        <footer><!-- 100 lines --></footer>
      `
    },
  },
}
```

### 3. Avoid Creating New Objects in Render

```javascript
// ✅ Good: Data on entity
const myEntity = { items: [1, 2, 3] }
render(entity, api) {
  return html`${entity.items.map(i => html`<li>${i}</li>`)}`
}

// ❌ Bad: Create new array in render
render(entity, api) {
  const items = api.getEntity("list").data.filter(x => x > 0) // New array!
  return html`${items.map(i => html`<li>${i}</li>`)}`
}
```

### 4. Use repeat() for Lists

```javascript
// ✅ Good: Help lit-html track identity
import { repeat } from 'lit-html'

render(entity, api) {
  return html`
    <ul>
      ${repeat(entity.items, item => item.id, (item) => html`<li>${item.name}</li>`)}
    </ul>
  `
}

// ❌ Less efficient: Let lit-html guess
render(entity, api) {
  return html`
    <ul>
      ${entity.items.map(item => html`<li>${item.name}</li>`)}
    </ul>
  `
}
```

## Memoization with compute()

For expensive derived state, use `compute()`:

```javascript
import { compute } from "@inglorious/store"

// Memoize: Only recalculate if dependencies change
const getExpensiveValue = compute(
  (items) => {
    console.log("Expensive calculation!")
    return items.filter((x) => x > 0).map((x) => x * 2)
  },
  [() => api.getEntity("list").items],
)

const result = getExpensiveValue()
// Next call uses cache if dependency unchanged
const resultAgain = getExpensiveValue()
```

## Next Steps

- **[Event System](./event-system.md)** — Understand events and the event queue
- **[Testing](../advanced/testing.md)** — How to test rendering logic
- **[Performance](../advanced/performance.md)** — Optimization techniques

Happy rendering! 🚀
