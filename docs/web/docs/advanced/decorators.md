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

## Adding more decorators

As the collection grows, additional decorators can be added in the same style. Keep each decorator focused on a single concern, return a behavior object that mirrors the wrapped type's handlers, and let the composed type decide how to use it.
