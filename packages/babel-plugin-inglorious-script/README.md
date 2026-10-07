# Babel Plugin: IngloriousScript

[![npm version](https://img.shields.io/npm/v/@inglorious/babel-plugin-inglorious-script.svg)](https://www.npmjs.com/package/@inglorious/babel-plugin-inglorious-script)

`@inglorious/babel-plugin-inglorious-script` is a Babel plugin that transforms your JavaScript code into **IngloriousScript**, a superset of JavaScript that provides intuitive, operator-overloaded vector math.

This allows you to write vector operations using familiar arithmetic operators (`+`, `-`, `*`, `/`, etc.), making your game logic cleaner, more readable, and less error-prone. The plugin uses hybrid static/runtime analysis to provide both compile-time optimizations and runtime safety for complex scenarios.

## Why IngloriousScript?

Working with vectors in game development often involves verbose and repetitive function calls:

```javascript
// Before: Standard JavaScript
import { add, scale, mod } from "@inglorious/utils/vector.js"

const newPosition = mod(add(position, scale(velocity, dt)), worldSize)
```

With IngloriousScript, you can write the same logic as a natural mathematical expression:

```javascript
// After: IngloriousScript
const newPosition = (position + velocity * dt) % worldSize
```

The plugin handles the transformation, giving you clean syntax with efficient execution and automatic type safety.

## Features

- **Intuitive Syntax**: Use standard math operators for vector arithmetic
- **Hybrid Analysis**: Static optimization when types are certain, runtime safety when they're not
- **Automatic Vector Preservation**: Maintains vector properties through component assignments and array operations
- **Mutative Integration**: Works seamlessly with state management libraries that modify object properties
- **Comprehensive Operator Support**: Binary, unary, and compound assignment operators
- **Smart Error Detection**: Catches mathematical errors at compile-time when possible

## Installation

First, install the plugin using your package manager:

```bash
npm install -D @inglorious/babel-plugin-inglorious-script
# or
yarn add -D @inglorious/babel-plugin-inglorious-script
# or
pnpm add -D @inglorious/babel-plugin-inglorious-script
```

Then, add it to your Babel configuration file (e.g., `.babelrc.json`):

```json
{
  "plugins": ["inglorious-script"]
}
```

## Usage

The plugin automatically detects vectors created with the `v` function and transforms the operations they are involved in. You don't need to manually import the `v` function - the plugin will automatically inject the import when it detects usage.

### Supported Operations

#### Vector-Vector Operations

Addition and subtraction between two vectors work as you'd expect:

```javascript
// No import needed - the plugin automatically adds it
const v1 = v(10, 20)
const v2 = v(1, 2)

const sum = v1 + v2 // Becomes sum(v1, v2)
const difference = v1 - v2 // Becomes subtract(v1, v2)
```

Component-wise multiplication is also supported:

```javascript
const v1 = v(2, 3)
const v2 = v(4, 5)
const hadamardProduct = v1 * v2 // Becomes multiply(v1, v2) -> v(8, 15)
```

#### Vector-Scalar Operations

You can use \*, /, %, and \*\* to operate on a vector with a scalar. The order of operands is flexible for all operators:

```javascript
const v1 = v(10, 20)
const s = 2

// Vector-first operations
const r1 = v1 * s // scale(v1, s)
const r2 = v1 / s // divide(v1, s)
const r3 = v1 % s // mod(v1, s)
const r4 = v1 ** s // power(v1, s)

// Scalar-first operations
const r5 = s * v1 // scale(v1, s)
const r6 = s / v1 // divideBy(s, v1)
const r7 = s % v1 // modOf(s, v1)
const r8 = s ** v1 // powerOf(s, v1)
```

#### Unary Operations

Negate a vector using the unary minus operator:

```javascript
const v1 = v(5, -10)
const negated = -v1 // Becomes scale(v1, -1)
```

#### Compound Assignments

Compound assignment operators are fully supported for in-place modifications:

```javascript
let position = v(0, 0)
const velocity = v(1, 2)

position += velocity // position = sum(position, velocity)
position *= 2 // position = scale(position, 2)
```

Supported assignment operators: `+=`, `-=`, `*=`, `/=`, `%=`, `**=`.

### Component-Wise Operations

You can modify individual vector components, and the plugin automatically preserves the vector's type properties:

```javascript
const entity = { position: v(10, 20) }

// Modify a single component
entity.position[0] += deltaX
// Automatically becomes: (entity.position[0] += deltaX, entity.position = ensureV(entity.position))

// Works with any computed access
entity.position[X] = newX
entity.position[Y] *= scaleFactor
```

This is especially useful when working with Mutative or other libraries that might strip custom properties from objects.

### Array Method Support

Vector objects support standard array methods, and the plugin automatically preserves their vector nature:

```javascript
const velocity = v(1, 2, 3)

// These all maintain vector properties:
const doubled = velocity.map((x) => x * 2) // ensureV(velocity.map(x => x * 2))
const positive = velocity.filter((x) => x > 0) // ensureV(velocity.filter(x => x > 0))
const xy = velocity.slice(0, 2) // ensureV(velocity.slice(0, 2))
const extended = velocity.concat([4]) // ensureV(velocity.concat([4]))

// Even reduce operations are handled intelligently:
const magnitude = velocity.reduce((sum, x) => sum + x * x, 0) // Returns scalar (no wrapping)
const doubled2 = velocity.reduce((acc, x) => [...acc, x * 2], []) // Returns vector (wrapped)
```

### Hybrid Static/Runtime Analysis

The plugin uses intelligent analysis to optimize your code:

#### Compile-Time Optimization

When variable types are certain, operations are optimized at compile-time and invalid operations are caught early:

```javascript
const v1 = v(1, 2)
const v2 = v(3, 4)

// This throws a compile-time error:
const result = v1 * v2
// Error: Cannot multiply two vectors. Did you mean dot product (dot(v1, v2)) or cross product (cross(v1, v2))?

// This is optimized to a direct function call:
const sum = v1 + v2 // Directly becomes sum(v1, v2)
```

#### Runtime Safety

When operand types can't be determined at compile-time (function returns, complex expressions, etc.), the plugin generates runtime helpers that handle all valid combinations:

```javascript
import { getForce } from "./physics.js"

let velocity = v(0, 0)
const force = getForce() // Could return vector or scalar

// The plugin generates runtime type checking:
velocity += force
// Becomes: velocity = __vectorSum(velocity, force)
// The helper handles vector+vector, but throws error for vector+scalar
```

#### Function Call Integration

The plugin handles complex expressions involving function calls:

```javascript
function getVector() {
  return v(1, 2)
}
function getScalar() {
  return 5
}

// This works correctly with runtime type checking:
const result = getVector() * getScalar() + v(3, 4)
```

### Mutative and State Management Integration

The plugin works seamlessly with Mutative and other state management libraries:

```javascript
import { create } from "mutative"

const gameState = {
  player: {
    position: v(10, 20),
    velocity: v(1, 2),
  },
}

const newState = create(gameState, (draft) => {
  // Even though Mutative creates plain objects, these operations work:
  draft.player.position += draft.player.velocity
  draft.player.position[0] *= 1.1 // Component assignment with auto-restoration
})
```

## Error Handling

The plugin provides helpful error messages for common mistakes:

```javascript
const velocity = v(5, 10)
const position = v(0, 0)

// Compile-time errors (when types are certain):
position + 5 // Error: Cannot add a vector and a non-vector
velocity * position // Error: Cannot multiply two vectors

// Runtime errors (when types are uncertain):
someFunction() + anotherFunction() // Runtime type checking with appropriate errors
```

## How It Works

`@inglorious/babel-plugin-inglorious-script` uses sophisticated AST analysis to:

1. **Auto-Import Management**: Automatically detects when `v()` is used and injects the necessary imports
2. **Track Vector Types**: Follows variable assignments and function calls to understand when values are vectors
3. **Static Optimization**: When types are certain, generates optimized function calls and catches errors early
4. **Runtime Safety**: When types are uncertain, generates helpers that perform runtime type checking
5. **Property Preservation**: Automatically maintains vector properties through component assignments and array operations
6. **Helper Injection**: Automatically imports and injects necessary helper functions and utilities

The plugin generates efficient code that balances performance with safety, ensuring your vector math is both fast and correct without requiring manual imports.

## Requirements

This plugin requires:

- `@inglorious/utils` package for vector operations and utilities
- Babel 7.x or higher
- Node.js 16 or higher

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
