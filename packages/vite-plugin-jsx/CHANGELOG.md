# @inglorious/vite-plugin-jsx

## 2.0.6

### Patch Changes

- Publish internal dependencies and peer dependencies as caret ranges instead of exact versions, and stop also listing peer dependencies as regular dependencies, so upgrading one package no longer causes version mismatches or duplicate installs

## 2.0.5

### Patch Changes

- Source files read top-down: the functions a module exports come first, and the helpers they use are defined below them. Modules import other files of their own package by relative path rather than by the package's name. Behaviour is unchanged.
- Updated dependencies
  - @inglorious/utils@5.1.0

## 2.0.4

### Patch Changes

- c81d687: Kebab-case props on components, such as `aria-label`, are quoted object keys instead of invalid code.
- Ship type declarations, so a `vite.config.ts` importing the plugin type-checks under `strict`.

## 2.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/utils@5.0.0

## 2.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/utils@4.0.0

## 2.0.1

### Patch Changes

- Add HMR Vite plugin

## 2.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.8.0

## 1.2.0

### Minor Changes

- Distinguish between in-scope and out-of-scope primitives in Vite plugins

## 1.1.1

### Patch Changes

- Decrease bundles size

## 1.1.0

### Minor Changes

- Add TSX web todomvc example

## 1.0.0

### Major Changes

- Add JSX support
