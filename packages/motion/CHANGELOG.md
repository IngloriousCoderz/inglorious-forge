# @inglorious/motion

## 9.0.19

### Patch Changes

- Renders nothing with lit's `nothing` rather than an empty string. `api.render` of a missing entity, `withErrorBoundary`'s default fallback, a `withMotion` or `withErrorBoundary` type with no `render`, and the charts' tooltip and hover targets return `nothing`. Attributes with no value are now left off instead of set empty: `src` and `accept`, a chart path's `d`, a virtual list's `class`, an icon's and an image cropper's `style`, and an OpenUI card's `aria-label`. `alt` stays empty on purpose: to a screen reader, that means a decorative image.
- Updated dependencies
- Updated dependencies
  - @inglorious/web@6.13.1

## 9.0.18

### Patch Changes

- Publish internal dependencies and peer dependencies as caret ranges instead of exact versions, and stop also listing peer dependencies as regular dependencies, so upgrading one package no longer causes version mismatches or duplicate installs
- Updated dependencies
  - @inglorious/web@6.10.2

## 9.0.17

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.10.1

## 9.0.16

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.10.0

## 9.0.15

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.9.1

## 9.0.14

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.9.0

## 9.0.13

### Patch Changes

- @inglorious/web@6.8.1

## 9.0.12

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.8.0

## 9.0.11

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.7.2

## 9.0.10

### Patch Changes

- @inglorious/web@6.7.1

## 9.0.9

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.7.0

## 9.0.8

### Patch Changes

- @inglorious/web@6.6.2

## 9.0.7

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.1

## 9.0.6

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.0

## 9.0.5

### Patch Changes

- @inglorious/web@6.5.2

## 9.0.4

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.1

## 9.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.0

## 9.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.2

## 9.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.1

## 9.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.0

## 8.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.3.0

## 7.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.2.0

## 6.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.2

## 6.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.1

## 6.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.0

## 5.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.0.0

## 4.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.2

## 4.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.1

## 4.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.0

## 3.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.5.1

## 3.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.5.0

## 2.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.4.0

## 1.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.3.0

## 0.2.0

### Minor Changes

- Add base Inglorious Motion implementation

## 0.1.1

### Patch Changes

- @inglorious/web@4.2.5
- Prefer event-first remove flow (`#id:removeWithMotion`) over helper function export.
- Add layout FLIP, presence wait groups, and shared layout (`motionLayoutId`) support.

## 0.1.0

### Minor Changes

- Initial release: `withMotion` composition helper and `removeWithMotion` convenience API.
