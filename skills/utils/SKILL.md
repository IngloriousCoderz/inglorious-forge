---
name: utils
description: "@inglorious/utils: vectors, math, objects, arrays, functions, storage, algorithms and physics helpers."
---

# @inglorious/utils

Prefer subpath imports. Mostly pure; side effects: RNG, `debounce`/`throttle`, `merge`/`set`, storage. Each module is named after the singular thing it is about (`math/vector.js` holds `add` and `scale`; `clamp` exists in both `number.js` and `vector.js`).

```javascript
import { v, ensureV } from "@inglorious/utils/v.js";
import { pipe, compose, isFunction } from "@inglorious/utils/function.js";
import { get, set, clone, produce, serialize, deserialize } from "@inglorious/utils/object";
import { extend, merge, defaults } from "@inglorious/utils/data-structures/object.js";
import { ensureArray, contains, remove } from "@inglorious/utils/data-structures/array.js";
import { createBoard, toString } from "@inglorious/utils/data-structures/board.js";
import { magnitude, sum, subtract, clamp, ZERO_VECTOR, UNIT_VECTOR } from "@inglorious/utils/math/vector.js";
import { mod, snap } from "@inglorious/utils/math/number.js";
import { lerp } from "@inglorious/utils/math/linear-interpolation.js";
import { random } from "@inglorious/utils/math/rng.js";
import { toRange, toRadians, toDegrees } from "@inglorious/utils/math/trigonometry.js";
import { decide } from "@inglorious/utils/algorithms/decision-tree.js";
import { findPath } from "@inglorious/utils/algorithms/path-finding.js";
import { applyVelocity } from "@inglorious/utils/physics/velocity.js";
import { applyFriction } from "@inglorious/utils/physics/friction.js";
import { applyGravity } from "@inglorious/utils/physics/gravity.js";
import { readJSON, writeJSON } from "@inglorious/utils/storage.js";
```

Storage helpers never throw. `readItem`/`writeItem` handle raw strings, including storages answering with promises (Capacitor Preferences); `parseJSON(raw, fallback)`. Also `pick(obj, keys)` in object and `isPromiseLike` in promise.

Namespace form: `import { algorithms, dataStructures, functions, math, physics, v } from "@inglorious/utils"`.

- Vectors are arrays tagged by `v()` (non-enumerable `__isVector__`) and mutable: copy shared ones with `v(...ZERO_VECTOR)`, not a spread (drops the tag). Name components: `const [, NO_RISE, NO_DEPTH] = ZERO_VECTOR`.
- `sum`/`subtract` take any number of vectors.
- `get(obj, "a.b.0.c")`, `set` mutates, `produce(obj, draft => ...)`, `extend` immutable deep merge, `merge` mutable, `defaults`.
- `serialize`/`deserialize`: event wire format (multiplayer).
- `random()` float 0–1, `random(1, 6)` integer, `random(0.5, 1.5)` float.
- `decide({ test: (ctx) => "branch", branch: () => ... }, ctx)`.
- `findPath({ nodes: { a: [0, 0] }, arcs: [{ from, to, cost }] }, "a", "c")`.
- `readJSON(key, fallback, storage = localStorage)` never throws; `writeJSON` returns `false` if not written.
