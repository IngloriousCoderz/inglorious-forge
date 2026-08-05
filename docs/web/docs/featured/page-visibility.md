---
title: PageVisibility
description: Track document visibility state with the PageVisibility sensor type
---

# PageVisibility

`PageVisibility` keeps document visibility state in the store.

## What it tracks

The `pageVisibility` entity keeps:

- `isSupported` — whether `document.visibilityState` is available
- `isVisible` — whether the page is currently visible
- `isWatching` — whether the visibility listener is active

## Usage

```javascript
import { createStore } from "@inglorious/store"
import { PageVisibility } from "@inglorious/web/sensors/page-visibility"

const store = createStore({
  types: { PageVisibility },
  autoCreateEntities: true,
})

const pageVisibility = store.getEntity("pageVisibility")
```

## Example

```javascript
if (!pageVisibility.isVisible) {
  // pause animations, reduce polling, etc.
}
```

## Learn more

- [Sensors overview](./sensors.md)
- [Inglorious Web overview](./overview.md)
