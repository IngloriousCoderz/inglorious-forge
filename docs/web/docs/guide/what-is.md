---
title: What is Inglorious Web?
description: Philosophy, design principles, ECS inspiration, and use cases
---

# What is Inglorious Web?

## One-Sentence Definition

**Inglorious Web is a lightweight web framework that renders your entire UI template on every state change and lets lit-html efficiently update only the changed DOM nodes.**

## What It Is

- **A state-driven web framework** built on `@inglorious/store` (entity-based state management)
- **Pure JavaScript** — no JSX required, no DSL, no compiler
- **Entity-based rendering** — each entity type defines its own `render(entity, api)` method
- **Full-tree re-renders** with DOM diffing via lit-html
- **Event-driven** — all state changes are explicit events
- **Type composition** — types as arrays of behaviors for cross-cutting concerns
- **Zero component state** — all state lives in the store
- **No signals** — no hidden reactivity graph, no automatic tracking
- **No subscriptions** — no cleanup needed, no memory leaks
- **No lifecycle hooks** — no special methods to manage
- **Built-in components** — router, forms, tables, virtual lists, select dropdowns

## What It Isn't

- **Not a reactive proxy system** — Vue's proxy approach is elegant but complex; Inglorious prefers explicit events
- **Not a fine-grained signal system** — Solid's signals are powerful but require a mental model shift
- **Not a VDOM framework** — React uses VDOM; Inglorious uses template strings + lit-html's efficient diffing
- **Not a minimalist library** — it's more structured than Alpine or HTMX
- **Not an observable-based framework** — no RxJS-style reactivity
- **Not a database** — it's a frontend state manager, not a query engine
- **Not a framework that forces a specific language** — works with JavaScript, TypeScript, JSX, Vue templates, etc.

## The Core Philosophy

### ✨ Full-Tree Render → Minimal DOM Update

Every time your state changes:

1. Your entire template function runs
2. lit-html compares the new template with the old one
3. **Only the changed DOM nodes are updated**

This gives you the **mental clarity of Svelte** (simple, no dependencies to track) with the **simplicity of vanilla JavaScript** (no compiler, no special syntax).

```javascript
// Your template always runs completely, but lit-html only updates what changed
const renderApp = (api) => html`
  <header>${api.render("header")}</header>
  <main>${api.render("content")}</main>
  <footer>${api.render("footer")}</footer>
`

// State change → template reruns → lit-html updates only changed parts
```

### Why This Approach?

| Challenge                       | Inglorious Solution                        |
| ------------------------------- | ------------------------------------------ |
| Complex reactivity graphs       | Full-tree render. Lit-html diffs it. Done. |
| Memory leaks from subscriptions | No subscriptions. No cleanup. No overhead. |
| Hidden dependencies             | Explicit: state changes → events → render  |
| Framework magic                 | Transparent: just JavaScript functions     |
| Steep learning curve            | Simple model: entities, events, renders    |

## ECS Inspiration

Inglorious Web (like Inglorious Store) is inspired by **Entity-Component-System** (ECS) architecture, common in game engines.

### What We Took from ECS

✅ **Entities** — Objects with state (like game objects)  
✅ **Types** — Behaviors grouped by entity type (like components in ECS)  
✅ **Events** — Pub/sub for decoupled communication (like ECS systems)  
✅ **Composition** — Behaviors stack on entities (like ECS archetypes)

### What We Didn't Take

❌ **Systems** — We don't have separate systems loop (React/Vue work differently)  
❌ **Sparse data** — Our entity storage is flat, not sparse  
❌ **Archetype optimization** — We optimize for UI, not 1M entities

### Why ECS-Inspired?

ECS solves a different problem (game loops, massive parallelism), but its core insight applies to UI:

> **"Decouple data from behavior through explicit messaging."**

In Inglorious Web:

- **Entities** = UI state (user, header, form, etc.)
- **Types** = UI behaviors (render, event handlers, lifecycle)
- **Events** = State transitions (notify, dispatch, etc.)
- **Composition** = Type arrays for guards, logging, analytics

This makes your UI:

- **Predictable** — No hidden effects, no reactive graph surprises
- **Testable** — Pure functions, explicit events, no setup needed
- **Debuggable** — Redux DevTools shows every state change
- **Composable** — Behaviors stack cleanly without wrapper hell

## The Rendering Model: Full-Tree Re-render

Most modern frameworks try to minimize re-renders:

| Framework | Approach              | Downside                                         |
| --------- | --------------------- | ------------------------------------------------ |
| React     | VDOM + reconciliation | Complex algorithm, Fiber scheduling, hooks rules |
| Vue       | Proxy-based tracking  | Autotracking complexity, proxy edge cases        |
| Solid     | Fine-grained signals  | Steep learning curve, reactive graph             |
| Svelte    | Compiler magic        | Requires build step, $-labeled reactivity        |

**Inglorious Web takes a different bet:**

> "Re-render the whole template → trust lit-html to diff efficiently."

```javascript
// Every state change triggers a full template re-render
store.subscribe(() => {
  // This function runs COMPLETELY on every state change
  const ui = renderApp(api)

  // But lit-html is smart: it only updates the DOM nodes that changed
  render(ui, container)
})
```

### Why This Works

1. **Template functions are fast** — JavaScript function calls are cheap
2. **lit-html is efficient** — It's optimized for template string diffing, not VDOM
3. **DOM updates are expensive, not template execution** — lit-html caches compiled templates
4. **No dependency tracking overhead** — Just run the function, diff, update DOM

### Performance Trade-off

| Metric             | Inglorious              | React                        | Vue                             |
| ------------------ | ----------------------- | ---------------------------- | ------------------------------- |
| Template execution | Fast (always full)      | Medium (selective re-render) | Medium (proxy tracking)         |
| DOM updates        | Fast (lit-html diffing) | Medium (VDOM diff)           | Fast (fine-grained)             |
| Memory overhead    | Minimal                 | High (VDOM, hooks, closures) | Medium (proxies, subscriptions) |
| Learning curve     | Very low                | Medium/High                  | Medium                          |

**In practice:** Inglorious Web is plenty fast for most UIs. The full-tree re-render overhead is negligible compared to DOM update overhead.

## When to Use Inglorious Web

✅ **Perfect For:**

- **Predictable, deterministic UIs** — Forms, dashboards, admin tools
- **Small to medium apps** — Where simplicity beats ecosystem size
- **Apps that value debuggability** — Redux DevTools support, time-travel
- **Teams that want pure JavaScript** — No JSX, no compiler, no magic
- **Hybrid UI/game contexts** — Shares architecture with @inglorious/engine
- **Component libraries** — Types are more customizable than React components
- **Learning frameworks** — Simple mental model, excellent for teaching
- **Performance-sensitive apps** — No framework overhead, no signal graph complexity
- **Testing-first development** — Pure handlers, simple triggers, no setup

❌ **Not Best For:**

- **Apps heavily dependent on ecosystem** — React has more libraries
- **Very large dynamic lists** — Though we have virtual list support
- **Teams deeply invested in React/Vue** — Migration cost outweighs benefits
- **Projects requiring server-side rendering** — (Use @inglorious/ssx for SSG)

## Perfect Use Cases

### 1. Internal Admin Tools

- Predictable state flow matters more than ecosystem size
- Redux DevTools debugging is invaluable
- Form handling with validation and submission is simple
- Type composition for role-based access control works elegantly

### 2. Component Design Systems

- Types are more customizable than React components
- Composition without wrapper hell
- Testing is trivial (no `@testing-library`)
- Documentation and storybook integration easy

### 3. Real-time Applications

- Full-tree render + lit-html diffing = predictable performance
- Event-driven architecture scales well
- No subscription management overhead
- Time-travel debugging in DevTools for troubleshooting

### 4. Single-Page Applications (SPAs)

- Simple routing with entity-based router
- State stays in store, UI is pure function of state
- Minimal bundle size
- No hydration issues (unlike server-rendered frameworks)

### 5. Games + Interactive Experiences

- Shares architecture with @inglorious/engine
- Game loop can update store
- UI re-renders in sync with game state
- Perfect for game menus, HUDs, inventory screens

## Perfect NOT-For Use Cases

### 1. Framework-Agnostic Component Distribution

- Inglorious Web types only work in Inglorious stores
- Use Web Components or React if you need cross-framework components

### 2. Marketing Sites with Heavy SEO

- Static sites use @inglorious/ssx (SSG)
- Client-only apps won't pre-render HTML for SEO
- Use Next.js, Astro, or Hugo if SEO is critical

### 3. Teams Invested in React Ecosystem

- Thousands of libraries built for React
- Migration cost is high
- Use React if your team knows it well

### 4. Real-time Rendering of 10,000+ Items

- Full-tree render still has overhead
- We have virtual list support, but Solid would be faster
- Use Solid if peak performance matters more than simplicity

## Why Choose Inglorious Web?

### 1. **Simplicity**

No signals, no VDOM, no subscriptions, no lifecycle hooks. Just:

- **State** (entities in store)
- **Events** (dispatch/notify)
- **Views** (render functions)

### 2. **Transparency**

Everything is explicit JavaScript. No framework magic, no hidden dependencies, no compiler artifacts.

```javascript
// That's it. No special setup, no decorators, no refs.
const counter = {
  increment(entity) {
    entity.count++
  },

  render(entity, api) {
    return html`<button @click=${() => api.notify("#counter:increment")}>
      ${entity.count}
    </button>`
  },
}
```

### 3. **Testing**

Pure functions. Call them directly. No setup needed.

```javascript
const { entity } = trigger({ count: 0 }, counter.increment)
expect(entity.count).toBe(1)
```

### 4. **Composition**

Types as arrays. No wrapper hell, no HOCs.

```javascript
const protected = [basePage, requireAuth, requireAdmin]
```

### 5. **Predictability**

Full-tree render means:

- No surprise re-renders
- No missing dependencies
- No subtle bugs from reactivity tracking

### 6. **Debugging**

Redux DevTools shows every event and every state change. Time-travel through your app's history.

### 7. **Performance**

lit-html's diffing is fast. Smaller bundle than React. No framework overhead.

## Philosophy Statement

> **Inglorious Web believes that web frameworks should not fight JavaScript.**

We embrace:

- **Plain JavaScript objects** for state (not proxies)
- **Plain JavaScript functions** for logic (not decorators)
- **Plain JavaScript strings** for templates (not JSX)
- **Explicit events** for state changes (not reactive tracking)
- **Simple composition** through arrays (not wrapper nesting)

We avoid:

- Compiler magic that hides the real cost
- Reactivity graphs that hide dependencies
- Frameworks that force you into their language or syntax
- Layers of abstraction that make debugging hard

**Result:** A framework that's fun to use, easy to understand, and a pleasure to debug.
