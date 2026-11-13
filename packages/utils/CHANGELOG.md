# @inglorious/utils

## 5.4.0

### Minor Changes

- `pick` in `object`, `isPromiseLike` in `promise`, and `parseJSON`, `readItem` and `writeItem` in `storage`: reading and writing strings without throwing, with a storage, a function giving one, or one answering with promises. `readJSON` and `writeJSON` also take a function giving the storage.

  `@inglorious/utils/promise` (without `.js`) resolves: it pointed to files that don't exist.

## 5.3.0

### Minor Changes

- - `asSettled`, in the new `@inglorious/utils/promise.js`, yields the results of several promises in the order they settle. The first rejection is thrown, and the promises still pending never end up as unhandled rejections, even when several fail or the loop stops early.
  - `keepLast` in `@inglorious/utils/array.js` keeps the last items of an array, such as the most recent entries of a log. A count of zero keeps nothing, where a bare `slice(-0)` would keep everything.

## 5.2.0

### Minor Changes

- - `readJSON` and `writeJSON` move from `@inglorious/engine/storage.js` to `@inglorious/utils/storage.js`, so apps that are not games can save and load JSON from `localStorage` too. `@inglorious/engine/storage.js` is gone: import them from utils.
  - `writeJSON` answers `false` where there is no storage at all, rather than claiming a write that never happened, and `readJSON` answers the fallback where reading throws, such as storage blocked by the browser.

## 5.1.0

### Minor Changes

- `clone` copies plain data by hand rather than through a JSON round trip, which is several times faster across thousands of small objects, and copies more of what it is given.

  - Vectors stay vectors. The tag that marks an array as one is not enumerable, so the JSON round trip and `structuredClone` both drop it.
  - A `Date`, a `Map`, a `Set` and anything else that is not a plain object or an array goes through `structuredClone`, so it is copied as what it is rather than turned into a string or an empty object.
  - A key set to `undefined` is kept, where JSON dropped it.
  - Functions are kept by reference rather than dropped.
  - `produce` uses `clone`, so it gets the same speed and the same copies.

## 5.0.0

### Major Changes

- Make all utils modules singular. The plural paths are gone:

  - `@inglorious/utils/objects.js` → `@inglorious/utils/object.js` (and `data-structures/objects.js` → `data-structures/object.js`)
  - `@inglorious/utils/vectors.js` → `@inglorious/utils/vector.js` (and `math/vectors.js` → `math/vector.js`)
  - `@inglorious/utils/quaternions.js` → `@inglorious/utils/quaternion.js` (and `math/quaternions.js` → `math/quaternion.js`)
  - `math/numbers.js` → `math/number.js`
  - `functions/functions.js` → `functions/function.js`

  New shortcuts: `@inglorious/utils/array.js` and `@inglorious/utils/function.js`.

## 4.0.0

### Major Changes

- Provide shortcut paths to common utils functions

## 3.8.0

### Minor Changes

- Use PascalCase for type names

## 3.7.3

### Patch Changes

- Decrease bundles size

## 3.7.2

### Patch Changes

- Add TSX web todomvc example

## 3.7.1

### Patch Changes

- Exclude tests from NPM package

## 3.7.0

### Minor Changes

- Add object get and set, update clone

## 3.6.3

### Patch Changes

- Add directory info in every package.json

## 3.6.2

### Patch Changes

- Add eager mode by default on store

## 3.6.1

### Patch Changes

- Create react-store package

## 3.6.0

### Minor Changes

- Add infinite scroll and more vector operations

## 3.5.3

### Patch Changes

- Add an example of IngloriousScript with TypeScript

## 3.5.2

### Patch Changes

- 84025bf: Fix import without extension breaking server

## 3.5.1

### Patch Changes

- 9d76980: Refine type definitions
