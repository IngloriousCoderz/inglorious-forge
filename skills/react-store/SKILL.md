---
name: react-store
description: React bindings for @inglorious/store (createReactStore, useNotify, useEntity, useSelector).
---

# @inglorious/react-store

Built on react-redux; works with Redux DevTools and React Native.

```javascript
import { createReactStore } from "@inglorious/react-store";
import { store } from "./store";

export const { Provider, useSelector, useNotify, useEntity } = createReactStore(store);
```

```jsx
function Counter() {
  const notify = useNotify();
  const { value } = useEntity("myCounter");
  return <button onClick={() => notify("increment")}>{value}</button>;
}
```

- `useNotify()` returns `notify(type, payload?)`.
- `useEntity(id)` selects one entity.
- `useSelector(selector, equalityFn?)` as in react-redux.
