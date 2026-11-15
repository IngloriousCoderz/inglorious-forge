---
title: Rendering Model
description: Full-tree rendering, lit-html diffing, and what it costs
---

# Rendering Model

Every store update runs the whole root render function, and lit-html updates only the DOM nodes whose values changed.

## The loop

1. An event is notified, from a click or from a handler.
2. The store applies it, and the events it leads to, then notifies its subscribers once.
3. `mount` runs the root render function, which calls `api.render(id)` for each entity it shows.
4. lit-html compares each template expression with its previous value and patches the DOM where they differ.

A render function has no state and no lifecycle: it runs when the store updates and only then. Nothing in a render can cause another render except notifying an event, which is a store update like any other.

## What it costs

The [benchmarks](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g) measure it against React, Vue, Svelte and Solid on the same apps, with the code public: the same tier as Vue and Svelte, and about 4 ms per update on a deliberately adversarial deep tree. Solid is faster under sustained sparse updates; nothing else is.

What does cost is work done inside a render that does not belong there: filtering a thousand rows, sorting, building lookups. Do it in a handler, when the data changes, or memoize it with `compute`, defined once outside the render:

```javascript
import { compute } from "@inglorious/store"

const selectVisibleTodos = compute(
  (todos, filter) => todos.filter((todo) => filter === "all" || !todo.isDone),
  [(state) => state.list.todos, (state) => state.footer.filter],
)

const List = {
  render(entity, api) {
    const todos = api.select(selectVisibleTodos)
    return html`<ul>
      ${todos.map((todo) => html`<li>${todo.text}</li>`)}
    </ul>`
  },
}
```

`compute` reruns only when an input changes by reference, which structural sharing makes cheap to tell.

## Lists

`repeat` from `@inglorious/web/directives/repeat` keys list items, so reordering moves nodes instead of rewriting them. Thousands of rows render only what is on screen with Inglorious UI's `VirtualList`.

## Next

- [Performance](../advanced/performance.md): measuring, and the few things worth optimizing.
- [Entity Render Methods](./entity-renders.md): how a type renders its entity.
