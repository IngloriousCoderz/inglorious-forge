---
title: Performance
description: Measuring first, and the few things worth optimizing
---

# Performance

Inglorious Web renders the whole tree on every update, and the [benchmarks](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g) put that in the same tier as Vue and Svelte, with the code public. Measure before optimizing: the browser's Performance tab shows what a render costs, and whether it is the template or the DOM.

## Keep renders cheap

A render reads fields and returns a template. Work that is more than that, filtering, sorting, building lookups, runs on every update. Do it in a handler, when the data changes, or memoize it with `compute`, defined once outside the render, so it reruns only when its inputs change:

```javascript
import { compute } from "@inglorious/store"

const selectVisibleRows = compute(
  (rows, filter) => rows.filter(matches(filter)).sort(byDate),
  [(state) => state.grid.rows, (state) => state.grid.filter],
)

render(entity, api) {
  return html`${api.select(selectVisibleRows).map(renderRow)}`
}
```

## Lists and bursts

`repeat` keys list items, and Inglorious UI's `VirtualList` renders only the rows on screen. Typing, scrolling and resizing notify many events: [`withDebounce` and `withThrottle`](./decorators.md) run the handler once per burst, and `handleRequest` drops the answers of requests a newer one replaced.

## Where state lives

A drag in progress, hover and focus do not belong in the store: they change on every pointer move and mean nothing once over. [Where State Lives](../guide/where-state-lives.md) says what stays with the browser.

## Bundle

The root entry holds `mount`, `html` and `svg`; everything else has its own subpath, so an app bundles only what it imports. Lazy routes split pages into their own chunks: `setRoutes({ "/admin": () => import("./pages/admin.js") })`.

## Games

A simulation where thousands of entities change every frame runs the store with `updateMode: "manual"` and `updateStrategy: "copy-on-dispatch"`, as [Inglorious Engine](https://inglorious.dev/engine/) does. The store's [reference](https://inglorious.dev/store/api/reference#updatestrategy-optional) explains the trade-off.
