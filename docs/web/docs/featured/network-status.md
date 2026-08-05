---
title: NetworkStatus
description: Track online/offline status with the NetworkStatus sensor type
---

# NetworkStatus

`NetworkStatus` keeps browser connectivity state in the store.

## What it tracks

The `networkStatus` entity keeps:

- `isSupported` — whether the browser exposes `navigator.onLine`
- `isOnline` — whether the browser is currently online
- `isWatching` — whether the online/offline listeners are active

## Usage

```javascript
import { createStore } from "@inglorious/store"
import { NetworkStatus } from "@inglorious/web/sensors/network-status"

const store = createStore({
  types: { NetworkStatus },
  autoCreateEntities: true,
})

const networkStatus = store.getEntity("networkStatus")
```

## Example

```javascript
const online = networkStatus.isOnline
if (!online) {
  console.warn("App is offline")
}
```

## Learn more

- [Sensors overview](./sensors.md)
- [Inglorious Web overview](./overview.md)
