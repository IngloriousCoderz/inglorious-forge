# @inglorious/store

## 11.1.0

### Minor Changes

- TypeScript checks a whole app with no casts. This changes types that TypeScript apps use; nothing changes at runtime.

  - `createStore<AppEntity, AppState>({ types: { Counter } })` checks each type against the entities of its name. Drop `types as unknown as TypesConfig<AppEntity>`: the cast no longer fits.
  - Declare a type's events and payloads with a `type` alias and write the type against it, `const Counter: CounterType = { ... }`: its parameters are inferred, and misspelled handlers and wrong payloads are errors. Turn existing `interface CounterType` declarations into `type CounterType =`: an interface does not fit `types`. As a less rigorous shorthand, `{ ... } satisfies EntityType<CounterEntity, AppApi>` infers the entity and the api without a declaration. `render` gets the api second, and behavior arrays, such as `[Chart, withRealtime]`, type too.
  - `BaseEntity` no longer accepts any field: declare each one on the entity, so a misspelled field is an error. It declares `id?: string` and `updatesWhilePaused?: boolean`. Handlers receive the entity with `id: string` (`Stored<TEntity>`), and so do `api.getEntity` and `api.getEntities`.
  - An app's `Api<AppEntity, AppState>` is accepted wherever the plain `Api` is, without the method bivariance the previous version relied on.
  - `compute` and `createSelector` infer the result function's arguments and the state; explicit type arguments still work.
  - `trigger` and `createMockApi` are typed as they work: `trigger(entity, Counter.add, 2)` returns `{ entity, events }`. `trigger`'s default mock api now holds the entity, so a handler can read it with `api.getEntity`.

## 11.0.5

### Patch Changes

- - An app's own `Api<AppEntity, AppState>` is accepted wherever the plain `Api` is, so passing it to `Chart.render`, `DataGrid.render` and the like no longer needs a cast. Event handlers in `EntityType` are checked as methods are, and `createStore` no longer infers the entity type from `types`.
  - UI component types (`ButtonType`, `DataGridType`, …) are type aliases rather than interfaces, so they fit a store's `types` as `ChartType` does.
  - `@inglorious/ui` declares its components for TypeScript at the root too: `import { Button } from "@inglorious/ui"` typechecks.
- @inglorious/utils@5.0.0

## 11.0.4

### Patch Changes

- TypeScript improvements:

  - `entities` can leave out the entities `autoCreateEntities` creates, instead of having to list every one in the state type.
  - `api.getEntity("i18n")` is typed as the state's `i18n` entity rather than the union of all entities, so its fields have their own types instead of `any`. Ids the state type does not name still give the union.

- `setType` notifies subscribers when it replaces a type, so a hot-reloaded type re-renders right away instead of at the next event. Adding a type, as a lazy `api.render` does, still notifies no one.

## 11.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/utils@5.0.0

## 11.0.2

### Patch Changes

- Provide shortcut paths to common utils functions
- Updated dependencies
  - @inglorious/utils@4.0.0

## 11.0.1

### Patch Changes

- Add HMR Vite plugin

## 11.0.0

### Major Changes

- Separate exports

## 10.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.8.0

## 9.6.0

### Minor Changes

- Allow getting all entities by type

## 9.5.3

### Patch Changes

- Fix state init in RTK migration

## 9.5.2

### Patch Changes

- Auto-update once after store initialization

## 9.5.1

### Patch Changes

- Initialize state directly instead of notifying events

## 9.5.0

### Minor Changes

- Remove allowTypes flag in favor of entity auto-creation

## 9.4.0

### Minor Changes

- Add api.select()

## 9.3.1

### Patch Changes

- Decrease bundles size
- Updated dependencies
  - @inglorious/utils@3.7.3

## 9.3.0

### Minor Changes

- Add functions for migration from RTK

## 9.2.0

### Minor Changes

- Add `autoCreateEntities` config option to store

## 9.1.0

### Minor Changes

- Add and document the compute() function for derived state

## 9.0.1

### Patch Changes

- Add TSX web todomvc example
- Updated dependencies
  - @inglorious/utils@3.7.2

## 9.0.0

### Major Changes

- Consolidate route config and type changing

## 8.0.1

### Patch Changes

- Exclude tests from NPM package
- Updated dependencies
  - @inglorious/utils@3.7.1

## 8.0.0

### Major Changes

- Notify lifecycle events as targeted

## 7.1.4

### Patch Changes

- Add lazy loaded routes feature

## 7.1.3

### Patch Changes

- Add a client-server Inglorious Web demo

## 7.1.2

### Patch Changes

- Improve web framework docs

## 7.1.1

### Patch Changes

- Fix events broadcasting instead of triggering single entities
- Add TS lint rules
  - @inglorious/utils@3.7.0

## 7.1.0

### Minor Changes

- Add type retrieval function in store

## 7.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.7.0

## 6.2.1

### Patch Changes

- Add directory info in every package.json
- Updated dependencies
  - @inglorious/utils@3.6.3

## 6.2.0

### Minor Changes

- Provide convenience functions for event handler testing

## 6.1.3

### Patch Changes

- Add tests and provide different file structure on RT example

## 6.1.2

### Patch Changes

- Simplify type definitions in example TS app

## 6.1.1

### Patch Changes

- Add type safety

## 6.1.0

### Minor Changes

- Turn devtools enhancer into a middleware

### Patch Changes

- Add real-time app example

## 6.0.1

### Patch Changes

- Improve store's README docs

## 6.0.0

### Major Changes

- Move all eager logic to store and devtools

## 5.5.0

### Minor Changes

- Simplify behavior definition

## 5.4.1

### Patch Changes

- Cleanup API augmentation with middlewares

## 5.4.0

### Minor Changes

- Add eager mode by default on store

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.6.2

## 5.3.0

### Minor Changes

- Enable eager mode by default on store

## 5.2.0

### Minor Changes

- Create react-store package

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.6.1

## 5.1.0

### Minor Changes

- Move multiplayer middleware and devtools to store

## 5.0.1

### Patch Changes

- Document store as a standalone state manager

## 5.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.6.0

## 4.0.5

### Patch Changes

- Updated dependencies
  - @inglorious/utils@3.5.3

## 4.0.4

### Patch Changes

- Updated dependencies [84025bf]
  - @inglorious/utils@3.5.2

## 4.0.3

### Patch Changes

- Updated dependencies [9d76980]
  - @inglorious/utils@3.5.1
