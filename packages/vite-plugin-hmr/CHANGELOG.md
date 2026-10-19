# @inglorious/vite-plugin-hmr

## 1.1.0

### Minor Changes

- Hot reloading works for the apps create-app generates:

  - `mount()` can be nested in a top-level statement, as in `ready.then(() => mount(store, ...))`, when the store is imported.
  - The store can be wrapped by an enhancer, as in `mount(withTransitions(store), ...)`; the wrapped store is registered, without calling the enhancer again.
  - A `types` object under a TypeScript cast, such as `as unknown as TypesConfig<AppEntity>`, is still read.
  - Types in `.vue` files get their own hot-update boundary.

### Patch Changes

- Ship type declarations, so a `vite.config.ts` importing the plugin type-checks under `strict`.

## 1.0.0

### Major Changes

- Add HMR Vite plugin
