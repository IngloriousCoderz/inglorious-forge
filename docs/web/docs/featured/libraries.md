---
title: Building Component Libraries
description: Publishing types and behaviors others can adapt
---

# Building Component Libraries

A library of Inglorious Web types is a library of plain objects. Users adapt them by overriding a render, adding a handler or composing a behavior, with no prop interface to extend.

## Export types and behaviors

```javascript
// @mycompany/design-system
export const Card = {
  render(entity, api) {
    return html`<div class="card">
      <h2>${entity.title}</h2>
      ${entity.content}
    </div>`
  },
}

export const sortable = (type) => ({
  sortBy(entity, field) {
    entity.sortField = field
  },
  render(entity, api) {
    return html`${renderSortControls(entity, api)} ${type.render?.(entity, api)}`
  },
})

export const SortableGrid = [DataGrid, sortable]
```

A behavior is a decorator: it receives the type built so far, wraps what it needs and keeps the rest. Ship presets for common combinations.

## Users customize freely

```javascript
import { DataGrid, sortable } from "@mycompany/design-system"

const CustomGrid = {
  ...DataGrid,
  render(entity, api) {
    return html`<div class="my-grid">${DataGrid.render(entity, api)}</div>`
  },
}

const types = {
  Grid: [
    CustomGrid,
    sortable,
    {
      rowClick(entity, rowId) {
        entity.selectedRow = rowId
      },
    },
  ],
}
```

## Guidelines

- Take plugins and adapters as parameters of a factory (`createShare({ plugin })`), so users and tests supply their own.
- Keep handles out of entities: listeners, timers and elements live in the factory's closure, keyed by entity id, and go in `destroy`.
- Name events after what happened, with the subject first for broadcasts (`rowSelect`, `cartChange`).
- Changing a handler's signature breaks users' overrides: add handlers rather than change them, and say so in the changelog.

[Inglorious UI](https://inglorious.dev/ui), [charts](https://inglorious.dev/charts/), [motion](https://inglorious.dev/motion/) and [i18n](https://www.npmjs.com/package/@inglorious/i18n) are built this way.
