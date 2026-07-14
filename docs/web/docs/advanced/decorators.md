---
title: Decorators
description: Reusable behavior helpers for type composition in Inglorious Web
---

# Decorators

Decorators are reusable behavior helpers that wrap a type's handlers without requiring you to hand-roll the same interception logic every time. They fit naturally into Inglorious Web's array-based composition model and are a good fit for concerns such as debouncing, cleanup, validation, or other cross-cutting behavior.

## withDebounce

The built-in `withDebounce` decorator wraps selected handlers with per-entity debouncing. It is especially useful for handlers that should not fire repeatedly while a user is typing or interacting quickly.

```javascript
import { withDebounce } from "@inglorious/web/decorators/with-debounce"

const types = {
  AutosaveForm: [Form, withDebounce(500, ["saveData"])],
  SearchBox: [Combobox, withDebounce({ optionsLoad: 300, saveQuery: 800 })],
}
```

### How it works

- A delay can be provided for all wrapped handlers or per handler.
- Debouncing is scoped per entity so each entity keeps its own pending timer state.
- Pending work is cancelled when the entity is destroyed, avoiding stale callbacks.

### When to use it

Use `withDebounce` for handlers such as:

- save operations
- search requests
- autosuggest lookups
- any other event that should coalesce rapid input

## withThrottle

The built-in `withThrottle` decorator wraps selected handlers with per-entity throttling. Unlike debouncing (which delays and deduplicates), throttling ensures a handler runs at most once every `delay` milliseconds during rapid-fire events. By default, the first call in a burst runs immediately (leading edge). Optionally, you can enable `hasTrailing` to also invoke the handler once more after the delay with the final call's arguments, ensuring no state is lost.

```javascript
import { withThrottle } from "@inglorious/web/decorators/with-throttle"

const types = {
  // Leading-edge only (default)
  ScrollTracker: [Base, withThrottle(200, ["scroll"])],
  // Leading + trailing
  ResizablePanel: [
    Base,
    withThrottle({ resize: 100 }, undefined, { hasTrailing: true }),
  ],
}
```

### How it works

- A delay can be provided for all wrapped handlers or per handler.
- By default, the handler fires on the leading edge (first call immediately), and subsequent calls are throttled for the delay period.
- With `hasTrailing: true`, the handler also fires once more after the delay with the most recent suppressed call's arguments.
- Throttling is scoped per entity so each entity keeps its own throttle window.
- Pending work is cancelled when the entity is destroyed, avoiding stale callbacks.

### When to use it

Use `withThrottle` for handlers such as:

- scroll or resize events (frequent, need responsive leading edge)
- mouse move tracking
- any high-frequency event that needs rate limiting while staying responsive

Use `hasTrailing: true` when you need to ensure the final state of a burst is never dropped (e.g., ending a resize or scroll and needing to capture the final position).

## Adding more decorators

As the collection grows, additional decorators can be added in the same style. Keep each decorator focused on a single concern, return a behavior object that mirrors the wrapped type's handlers, and let the composed type decide how to use it.
