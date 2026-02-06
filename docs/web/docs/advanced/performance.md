---
title: Performance Optimization
description: Measurement, optimization strategies, and benchmark comparisons
---

# Performance Optimization

Inglorious Web is designed to be fast, but here are tips to optimize further.

## Measurement

First, measure your actual performance using the browser's Performance API:

```javascript
const store = createStore({ types, entities })

store.subscribe(() => {
  const start = performance.now()
  renderApp(store.api)
  const end = performance.now()

  if (end - start > 16) {
    console.warn(`Slow render: ${end - start}ms`)
  }
})
```

Use browser DevTools Performance API:

```javascript
// Profile rendering
performance.mark("render-start")
// ... render code ...
performance.mark("render-end")
performance.measure("render", "render-start", "render-end")
```

Or open the browser's Performance tab in DevTools to see frame rates and rendering times.

## Full-Tree Render Optimization

### 1. Break Into Multiple Entities

Instead of one massive entity:

```javascript
// ❌ Bad: Monolithic
const app = {
  render(entity, api) {
    return html`
      <header><!-- 100 lines --></header>
      <sidebar><!-- 200 lines --></sidebar>
      <main><!-- 300 lines --></main>
    `
  },
}

// ✅ Good: Composed
const app = {
  render(entity, api) {
    return html`
      <div>
        ${api.render("header")} ${api.render("sidebar")} ${api.render("main")}
      </div>
    `
  },
}
```

Smaller entities re-render faster because each is simpler.

### 2. Use Memoization

Cache expensive computations:

```javascript
import { compute } from '@inglorious/store'

const getExpensiveValue = compute(
  (items) => {
    // Only runs if items changes
    return items
      .filter(x => x.value > 0)
      .map(x => processItem(x))
      .reduce((sum, x) => sum + x.value, 0)
  },
  [() => api.getEntity('list').items]
)

render(entity, api) {
  const total = getExpensiveValue()
  return html`<p>Total: ${total}</p>`
}
```

### 3. Avoid Creating Objects in Render

```javascript
// ❌ Bad: New object every render
render(entity, api) {
  const styles = { color: entity.color, fontSize: '16px' }
  return html`<div style=${JSON.stringify(styles)}>Text</div>`
}

// ✅ Good: Use styleMap
import { styleMap } from 'lit-html'

render(entity, api) {
  return html`
    <div style=${styleMap({
      color: entity.color,
      fontSize: '16px',
    })}>Text</div>
  `
}
```

## List Performance

### Use repeat() Directive

```javascript
import { repeat } from 'lit-html'

render(entity, api) {
  return html`
    <ul>
      ${repeat(
        entity.items,
        item => item.id,              // Key function
        (item, index) => html`
          <li>${item.name}</li>
        `
      )}
    </ul>
  `
}
```

This helps lit-html track which item is which during reorders.

### Virtual Scrolling for Large Lists

```javascript
import { list } from "@inglorious/web/list"

const types = {
  itemList: {
    ...list,

    renderItem(item, index) {
      return html`<div>${item.name}</div>`
    },
  },
}

const entities = {
  items: {
    type: "itemList",
    items: hugeArray,
    viewportHeight: 600,
    itemHeight: 50, // Fixed height for efficiency
  },
}
```

Only renders visible items, huge performance gain for 1000+ items.

## Event Batching

Events are automatically batched into a queue for atomic updates:

```javascript
// These all batch together
api.notify("#item:select", 1)
api.notify("#item:highlight", 1)
api.notify("#list:refresh")

// Result: Single re-render for all three events
```

This is optimal for performance. For manual control in game loops or animations:

```javascript
const store = createStore({
  types,
  entities,
  updateMode: "manual", // Don't update automatically
})

// Trigger events, then manually call update
function gameLoop() {
  api.notify("#player:move", { x: 10 })
  api.notify("#enemy:update")

  // All events processed, render happens here
  store.update()

  requestAnimationFrame(gameLoop)
}

gameLoop()
```

This gives you precise control over when re-renders happen, which is important for:

- Game loops (60 FPS sync)
- Animation loops
- Matching other update frequencies

## DOM Diffing

lit-html's template diffing is already optimized. A few tips:

### Cache Templates

```javascript
// ❌ Creates new template every render
const myTemplate = () => html`<div>${value}</div>`

// ✅ Reuse template
const template = html`<div>${value}</div>`
render(entity, api) {
  return template
}
```

### Use Directives

```javascript
import { when, choose } from 'lit-html'

// when: Avoids building template if condition is false
render(entity, api) {
  return when(
    entity.isLoading,
    () => html`<p>Loading...</p>`,
    () => html`<p>Done!</p>`
  )
}
```

## Async Operations

### Minimize Blocking

```javascript
// ❌ Blocks render
const data = await fetchData()
render() // Can't start until fetch completes

// ✅ Non-blocking - set state before await, notify event after
async fetchData(entity, api) {
  entity.isLoading = true

  try {
    const data = await fetch('/api/data').then(r => r.json())
    // After await, notify event instead of updating entity
    api.notify("#dataLoader:fetchSuccess", data)
  } catch (error) {
    api.notify("#dataLoader:fetchError", error.message)
  }
}

fetchSuccess(entity, data) {
  entity.isLoading = false
  entity.data = data
}

fetchError(entity, error) {
  entity.isLoading = false
  entity.error = error
}
// UI updates as loading state changes
```

### Debounce Expensive Operations

```javascript
const debounced = (type) => {
  let timeout

  return {
    search(entity, term, api) {
      clearTimeout(timeout)

      entity.searchTerm = term
      entity.isSearching = true

      timeout = setTimeout(async () => {
        try {
          const results = await searchAPI(term)
          entity.results = results
        } finally {
          entity.isSearching = false
        }
      }, 300)
    },
  }
}
```

## Bundle Size

All sizes below are gzipped and intended as a high-level comparison.

| Package / Bundle | Size (gzipped) |
| ---------------- | -------------- |
| React + RTK      | 74.9 KB        |
| Vue + Pinia      | 73.9 KB        |
| React            | 60.4 KB        |
| Vue              | 47.2 KB        |
| Inglorious Web   | 15.4 KB        |
| Svelte           | 15 KB          |
| Solid            | 8.5 KB         |

To reduce bundle size further:

- Use tree-shaking — only import what you need
- Avoid importing unused components
- Lazy-load routes and heavy modules
- Use dynamic imports

```javascript
// Good: Only import what you use
import { form } from "@inglorious/web/form"
import { router } from "@inglorious/web/router"

// Lazy load
const admin = () => import("./pages/admin")
```

## When Performance Matters Most

### Critical Paths

Optimize high-traffic paths:

- **Initial page load** — Lazy load heavy routes
- **Frequent interactions** — Debounce searches, use memoization
- **Large lists** — Use virtual scrolling
- **Expensive computations** — Use `compute()` memoization

### Profiling Tools

Use browser DevTools:

1. **Performance tab** — Measure rendering time
2. **Performance Observer** — Track custom metrics
3. **Lighthouse** — Audit overall performance

```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 16) {
      console.warn(`Slow: ${entry.name} (${entry.duration}ms)`)
    }
  }
})

observer.observe({ entryTypes: ["measure"] })
```

## Benchmarking

Compare approaches:

```javascript
const benchmark = async (name, fn, iterations = 1000) => {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()
  console.log(
    `${name}: ${(end - start / iterations).toFixed(3)}ms per iteration`,
  )
}

benchmark("Full render", () => renderApp(api))
benchmark("Handler call", () => counter.increment(entity))
```

## Best Practices

✅ **Do:**

- Measure first, optimize second
- Break large entities into smaller ones
- Use `repeat()` for lists
- Use virtual scrolling for 1000+ items
- Memoize expensive computations
- Batch events (automatic by default)
- Lazy load routes and heavy components
- Profile with browser DevTools

❌ **Don't:**

- Optimize prematurely
- Create objects in render
- Forget memoization for expensive operations
- Use full-tree renders for 10,000+ DOM nodes
- Load everything upfront
- Ignore bundle size

## Next Steps

- **[Testing](./testing.md)** — Performance testing patterns
- **[Error Handling](./error-handling.md)** — Robust error handling

Happy optimizing! ⚡
