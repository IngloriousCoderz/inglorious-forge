# @inglorious/eslint-config

## 1.1.4

### Patch Changes

- - `no-magic-numbers` is off in every test and spec file, TypeScript and JSX included, and in TypeScript and JSX stories.
  - `eslint-plugin-react-hooks` and `eslint-plugin-turbo` are no longer peer dependencies: no config used them. `eslint-plugin-tailwindcss` is an optional one, so it is installed only by projects using the `tailwind` config.

## 1.1.3

### Patch Changes

- Publish `typescript.js`, `typescript.d.ts` and `browser.d.ts`, which 1.1.2 declared but left out of the package. `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` are now peer dependencies, so a project importing `@inglorious/eslint-config/typescript` gets them installed, and unused variables are warnings in TypeScript as they already are in JavaScript.

## 1.1.2

### Patch Changes

- Decrease bundles size

## 1.1.1

### Patch Changes

- Fix missing eslint dependency in global config

## 1.1.0

### Minor Changes

- Add TS lint rules

## 1.0.1

### Patch Changes

- Support eager and lazy loading of images

## 1.0.0

### Major Changes

- Publish eslint-config to be used in scaffolded games
