---
title: Redux DevTools Integration
description: Debugging with Redux DevTools, time travel, and event inspection
---

# Redux DevTools Integration

Inglorious Web includes first-class support for the Redux DevTools Extension, giving you powerful debugging capabilities.

## Setup

### 1. Install Redux DevTools Extension

Browser extensions:

- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmjabgkhjhnbefga30thljilipkdlnad)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdi40ohlemmapaheknm)

### 2. Create Middleware

```javascript
import { createDevtools } from "@inglorious/web"

export const devtools = createDevtools()
```

### 3. Pass to Store

```javascript
import { createStore } from "@inglorious/web"
import { devtools } from "./devtools"

const store = createStore({
  types,
  entities,
  middlewares: [devtools.middleware],
})
```

## Features

### Event Timeline

Every event you dispatch appears in the DevTools timeline:

```javascript
// Dispatch event
api.notify("#counter:increment", 5)

// Shows up in DevTools as:
// Action: #counter:increment
// Payload: { value: 5 }
// Previous State: { count: 0 }
// New State: { count: 5 }
```

### Time Travel

Rewind and replay events:

1. Click any event in the timeline
2. App jumps to that state
3. Make changes, step back/forward

Perfect for debugging complex state flows!

### Action Filtering

You can filter which events appear in the DevTools in three independent ways; these can be combined:

- `blacklist` / `whitelist` — simple lists of event types to exclude or include.
- `filter` — a custom predicate function that receives the event and config and returns `true` to log.

Examples:

1. Use a blacklist to hide noisy internal events:

```javascript
const devtools = createDevtools({
  filters: {
    updateMode: "auto",
    blacklist: ["#internal:heartbeat", "#metrics:tick"],
  },
})
```

2. Use a whitelist to show only specific event types:

```javascript
const devtools = createDevtools({
  filters: {
    whitelist: ["#user:login", "#user:logout", "#router:navigate"],
  },
})
```

3. Use a custom `filter` predicate for arbitrary logic (for example, only log events for the current user):

```javascript
const devtools = createDevtools({
  filters: {
    filter: (event) => event.payload && event.payload.userId === currentUserId,
  },
})
```

4. Combine all three rules — blacklist, whitelist and predicate — they are ANDed together (and `updateMode` must be `"auto"`):

```javascript
const devtools = createDevtools({
  filters: {
    updateMode: "auto", // this is the default, you can omit it
    blacklist: ["#internal:heartbeat"],
    whitelist: ["#user:login", "#user:logout", "#router:navigate"],
    filter: (event) => event.payload && event.payload.userId === currentUserId,
  },
})
```

Notes:

- If both `blacklist` and `whitelist` are empty, all events pass that stage. If `whitelist` is non-empty only listed events pass.
- A `filter` predicate gives you full flexibility to inspect payloads or timestamps, and runs after blacklist/whitelist checks.
- Because the filter pipeline checks `updateMode` first, setting `updateMode: "manual"` is an efficient way to disable DevTools logging entirely.

### State Inspection

View entire store state at any point:

- Expand/collapse entities
- Search for properties
- Copy state as JSON

### Dispatch Custom Events

Manually trigger events for testing:

1. Open DevTools console
2. Type: `$r.store.notify('#counter:increment')`
3. See state update instantly

## Advanced Configuration

### Custom Middleware Name

```javascript
const devtools = createDevtools({
  name: "My App",
  features: {
    pause: true, // Pause between events
    lock: true, // Lock state to prevent changes
    persist: true, // Remember history
    export: true, // Export state
    import: "custom", // Custom import behavior
    jump: true, // Time travel
    skip: true, // Skip events
    reorder: true, // Reorder events
    dispatch: true, // Dispatch events
    test: true, // Testing support
  },
})
```

### Action Sanitizer

Hide sensitive data:

```javascript
const devtools = createDevtools({
  actionSanitizer: (action) => ({
    ...action,
    payload: action.payload.type === "login" ? "***" : action.payload,
  }),
})
```

### State Sanitizer

Hide sensitive state:

```javascript
const devtools = createDevtools({
  stateSanitizer: (state) => ({
    ...state,
    user: {
      ...state.user,
      password: "***",
    },
  }),
})
```

## Debugging Workflows

### Debug Event Sequence

1. **Open DevTools**
2. **Perform user actions** in your app
3. **See event timeline** in DevTools
4. **Click events** to see state at each step
5. **Identify the problematic event**

### Debug State Mutations

1. **Find the event** that caused wrong state
2. **Click it in timeline**
3. **See previous and new state**
4. **Compare to find what changed**

### Replay Issues

1. **Export problematic event sequence**
2. **Import in another browser/device**
3. **App replays same actions**
4. **Exact same bug occurs** (reproducible!)

### Step Through Logic

1. **Dispatch event from console**
2. **Watch state update in DevTools**
3. **Check entity state**
4. **Verify render updated**

## In Production

For production builds, disable DevTools:

```javascript
import { createDevtools } from "@inglorious/web"

const middlewares = []

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}

const store = createStore({
  types,
  entities,
  middlewares,
})
```

Or use a feature flag:

```javascript
const middlewares = window.__ENABLE_DEVTOOLS__
  ? [createDevtools().middleware]
  : []
```

## Tips

✅ **Use DevTools for:**

- Debugging complex state flows
- Understanding event sequences
- Testing edge cases
- Reproducing user-reported issues
- Learning how your app works

❌ **Don't use DevTools to:**

- Store/retrieve state permanently
- Bypass normal event flow
- Skip event handlers

## Next Steps

- **[Testing](./testing.md)** — Complement DevTools with automated tests
- **[Error Handling](./error-handling.md)** — Debug errors with DevTools

Happy debugging! 🐛
