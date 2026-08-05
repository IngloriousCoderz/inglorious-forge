---
title: ElementSize
description: Track DOM element dimensions with the ElementSize sensor type
---

# ElementSize

`ElementSize` lets you track the width and height of a DOM element using `ResizeObserver`.

## What it tracks

The `elementSize` entity keeps:

- `width` — latest element width in pixels
- `height` — latest element height in pixels
- `isSupported` — whether `ResizeObserver` is available
- `isWatching` — whether the element is currently observed

## Usage

```javascript
import { createStore } from "@inglorious/store"
import { ElementSize } from "@inglorious/web/sensors/element-size"

const store = createStore({
  types: { ElementSize },
  autoCreateEntities: true,
})

const elementSize = store.getEntity("elementSize")
```

If you want to observe a specific element, pass a `selector` option in the `entities` config.

## Example

```javascript
import { createStore } from "@inglorious/store"
import { ElementSize } from "@inglorious/web/sensors/element-size"

const store = createStore({
  types: { ElementSize },
  entities: {
    elementSize: {
      type: "ElementSize",
      selector: "#board",
    },
  },
})

const elementSize = store.getEntity("elementSize")
```

When `autoCreateEntities` is enabled, the store can create a default `elementSize` entity automatically.

## Learn more

- [Sensors overview](./sensors.md)
- [Inglorious Web overview](./overview.md)
