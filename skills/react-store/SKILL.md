# @inglorious/react-store - Complete Reference

## Installation

```bash
npm install @inglorious/store @inglorious/react-store react react-dom
```

## Core Concept

Official React bindings for @inglorious/store, built on `react-redux` with a simplified event API.

## Quick Start

### 1. Create a Store

```javascript
import { createStore } from "@inglorious/store"

const types = {
  counter: {
    increment(entity) {
      entity.value++
    },
    decrement(entity) {
      entity.value--
    },
  },
}

const entities = {
  myCounter: { type: "counter", value: 0 },
}

export const store = createStore({ types, entities })
```

### 2. Create React Bindings

```javascript
import { createReactStore } from "@inglorious/react-store"
import { store } from "./store"

export const { Provider, useSelector, useNotify, useEntity } =
  createReactStore(store)
```

### 3. Use in Components

```jsx
import { useNotify, useEntity } from "./react-store"

function Counter() {
  const notify = useNotify()
  const { value } = useEntity("myCounter")

  return (
    <div>
      <h1>Count: {value}</h1>
      <button onClick={() => notify("increment")}>+</button>
      <button onClick={() => notify("decrement")}>-</button>
    </div>
  )
}
```

## API Reference

### `createReactStore(store)`

Returns:

- `Provider`
- `useSelector`
- `useNotify`
- `useEntity`

### `useNotify()`

Returns a `notify(type, payload?)` function for dispatching events.

### `useSelector(selector, equalityFn?)`

Same behavior as `react-redux`’s `useSelector`.

### `useEntity(id)`

Convenience hook to select a single entity by ID.

## Notes

- Compatible with Redux DevTools via @inglorious/store.
- Works anywhere `react-redux` works (including React Native).
