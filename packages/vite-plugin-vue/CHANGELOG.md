# @inglorious/vite-plugin-vue

## 1.0.7

### Patch Changes

- Publish internal dependencies and peer dependencies as caret ranges instead of exact versions, and stop also listing peer dependencies as regular dependencies, so upgrading one package no longer causes version mismatches or duplicate installs

## 1.0.6

### Patch Changes

- Source files read top-down: the functions a module exports come first, and the helpers they use are defined below them. Modules import other files of their own package by relative path rather than by the package's name. Behaviour is unchanged.
- Updated dependencies
  - @inglorious/utils@5.1.0

## 1.0.5

### Patch Changes

- c497558: Templates that make up an app shell compile correctly:

  - Imported functions keep their name inside `{{ }}`: `{{ t("home.title") }}` calls the imported `t` instead of `entity.t`.
  - Inline functions in bound props pass through: `:onChange="(value) => api.notify('#app:select', value)"`.
  - An interpolation spread over several lines, as Prettier wraps a long one, is still read as an expression.
  - Kebab-case props on components, such as `:aria-label`, are quoted object keys instead of invalid code.
  - Several root elements, such as a header, a main and a footer, render as one template instead of producing invalid code.

- Ship type declarations, so a `vite.config.ts` importing the plugin type-checks under `strict`.

## 1.0.4

### Patch Changes

- Updated dependencies
  - @inglorious/utils@5.0.0

## 1.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/utils@4.0.0

## 1.0.2

### Patch Changes

- Add HMR Vite plugin

## 1.0.1

### Patch Changes

- Fix entity binding in Vue plugin

## 1.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.8.0

## 0.3.0

### Minor Changes

- Distinguish between in-scope and out-of-scope primitives in Vite plugins

## 0.2.1

### Patch Changes

- Decrease bundles size

## 0.2.0

### Minor Changes

- Publish Vue plugin for Vite
