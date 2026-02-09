# @inglorious/utils - Complete Reference

## Installation

```bash
npm install @inglorious/utils
```

## Core Concepts

- Pure, composable utilities for plain arrays and objects.
- Vector helpers use arrays tagged by `v()` with a non-enumerable `__isVector__` property.
- Prefer subpath imports for tree-shaking and smaller bundles.

## Entry Points

Use either subpath imports (preferred) or the namespace exports.

```javascript
import { v } from "@inglorious/utils/v.js"
import { pipe, compose } from "@inglorious/utils/functions/functions.js"
import {
  get,
  set,
  clone,
  produce,
} from "@inglorious/utils/data-structures/object.js"
import { magnitude } from "@inglorious/utils/math/vector.js"
import { sum } from "@inglorious/utils/math/vectors.js"
import { findPath } from "@inglorious/utils/algorithms/path-finding.js"
import { applyVelocity } from "@inglorious/utils/physics/velocity.js"
```

```javascript
import {
  algorithms,
  dataStructures,
  functions,
  math,
  physics,
  v,
} from "@inglorious/utils"
```

## Functions

### `pipe` and `compose`

```javascript
import { pipe, compose } from "@inglorious/utils/functions/functions.js"

const add = (a) => (b) => a + b
const multiply = (a) => (b) => a * b

const leftToRight = pipe(add(5), multiply(2))
const rightToLeft = compose(multiply(2), add(5))

leftToRight(10) // 30
rightToLeft(10) // 30
```

### `isFunction`

```javascript
import { isFunction } from "@inglorious/utils/functions/function.js"

isFunction(() => {}) // true
isFunction(123) // false
```

## Data Structures

### Arrays

```javascript
import {
  ensureArray,
  contains,
  remove,
} from "@inglorious/utils/data-structures/array.js"

ensureArray(1) // [1]
contains([1, 2, 3], 2) // true
remove([1, 2, 3], 2) // [1, 3]
```

### Objects

```javascript
import {
  get,
  set,
  clone,
  produce,
} from "@inglorious/utils/data-structures/object.js"

const obj = { a: { b: [{ c: 3 }] } }

get(obj, "a.b.0.c") // 3
set(obj, "a.b.0.d", 4)

const next = produce(obj, (draft) => {
  draft.a.b[0].c = 10
})

const deepCopy = clone(next)
```

### Deep Merge

```javascript
import {
  extend,
  merge,
  defaults,
} from "@inglorious/utils/data-structures/objects.js"

const base = { a: { b: 1 }, list: [1] }
const update = { a: { c: 2 }, list: [2] }

const immutableMerged = extend(base, update)
const mutableMerged = merge({ ...base }, update)

const withDefaults = defaults({ a: null }, { a: 1, b: 2 })
```

### Board Utilities

```javascript
import {
  createBoard,
  toString,
} from "@inglorious/utils/data-structures/board.js"

const board = createBoard([2, 3], (row, col) => `${row}:${col}`)
const text = toString(board, [2, 3])
```

## Math

### Vectors

```javascript
import { v, ensureV } from "@inglorious/utils/v.js"
import { magnitude, clamp } from "@inglorious/utils/math/vector.js"
import { sum, subtract } from "@inglorious/utils/math/vectors.js"

const position = v(10, 20)
const velocity = v(2, -1)

const next = sum(position, velocity) // [12, 19]
const len = magnitude(next)
const limited = clamp(next, 0, 10)

const many = sum(position, velocity, v(1, 1))
const diff = subtract(position, velocity)

const arr = [0, 1].map((x) => x + 1)
const asVector = ensureV(arr)
```

### Numbers, RNG, Trigonometry

```javascript
import { clamp, mod, snap } from "@inglorious/utils/math/numbers.js"
import { lerp } from "@inglorious/utils/math/linear-interpolation.js"
import { random } from "@inglorious/utils/math/rng.js"
import {
  toRange,
  toRadians,
  toDegrees,
} from "@inglorious/utils/math/trigonometry.js"

clamp(12, 0, 10) // 10
lerp(0, 10, 0.5) // 5
mod(-1, 10) // 9
snap(13, 5) // 15

random() // float between 0 and 1
random(1, 6) // integer between 1 and 6
random(0.5, 1.5) // float between 0.5 and 1.5

toRange(5 * Math.PI) // normalize angle
toRadians(180) // pi
toDegrees(Math.PI) // 180
```

## Algorithms

### Decision Trees

```javascript
import { decide } from "@inglorious/utils/algorithms/decision-tree.js"

const tree = {
  test: ({ age }) => (age >= 18 ? "adult" : "minor"),
  adult: () => "access",
  minor: () => "deny",
}

decide(tree, { age: 21 }) // "access"
```

### Path Finding

```javascript
import { findPath } from "@inglorious/utils/algorithms/path-finding.js"

const graph = {
  nodes: {
    a: [0, 0],
    b: [1, 0],
    c: [2, 0],
  },
  arcs: [
    { from: "a", to: "b", cost: 1 },
    { from: "b", to: "c", cost: 1 },
  ],
}

findPath(graph, "a", "c") // ["a", "b", "c"]
```

## Physics

```javascript
import { applyVelocity } from "@inglorious/utils/physics/velocity.js"
import { applyFriction } from "@inglorious/utils/physics/friction.js"
import { applyGravity } from "@inglorious/utils/physics/gravity.js"
import { v } from "@inglorious/utils/v.js"

let position = v(0, 0, 0)
let velocity = v(10, 0, 0)

;({ position, velocity } = applyVelocity(
  { position, velocity, maxSpeed: 12 },
  0.016,
))
velocity = applyFriction({ velocity, friction: 1 }, 0.016)

const gravityStep = applyGravity(
  {
    position,
    vy: 0,
    maxJump: 2,
    maxLeap: 4,
    maxSpeed: 5,
  },
  0.016,
)
```
