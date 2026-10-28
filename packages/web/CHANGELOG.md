# @inglorious/react-store

## 6.10.0

### Minor Changes

- In an app with the `Router` type, `mount` announces each navigation to screen readers and moves focus back to the top of the new page, as a full page load would. `getPageName` chooses what is announced and `hasAccessibleNavigation: false` turns it off. Links with `data-is-focus-kept` navigate with `state: { isFocusKept: true }`, which keeps focus where it is.

### Patch Changes

- Updated dependencies
  - @inglorious/store@12.1.0

## 6.9.1

### Patch Changes

- The README's quick start registers its `Counter` type under the name its entities use, so the example works as written.

## 6.9.0

### Minor Changes

- `@inglorious/web/pwa` keeps an installed PWA on its latest version. `watchPwaUpdate(registration)` checks for a new version hourly and on every return to the foreground, and applies a downloaded one at launch and on each trip to or from the background, when nobody is mid-task. Given the store, it announces a version that lands mid-session to the `PwaUpdate` type, whose `isUpdateReady` flag and `pwaUpdateApply` event power an "Update now" button.

## 6.8.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/store@12.0.0
  - @inglorious/utils@5.1.0

## 6.8.0

### Minor Changes

- Export `nothing` from `@inglorious/web`. Bind it to leave an attribute off: `id=${id || nothing}` renders no `id` at all, rather than an invalid `id=""`.

## 6.7.2

### Patch Changes

- Documented imports point to paths that exist: `createReactStore`'s JSDoc types come from `@inglorious/store`, and the Web README imports `optimistic` from `@inglorious/store/optimistic` rather than a `withOptimistic` that it does not export.
- Updated dependencies
  - @inglorious/store@11.3.0

## 6.7.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.2.0

## 6.7.0

### Minor Changes

- Types follow the store's: an entity drawn by a library type extends its entity interface, such as `interface AppRouterEntity extends RouterEntity { type: "Router" }`, and the type registers under any name with no cast.

  - `@inglorious/web`'s `Api` is the store's, which loading web's types gives a `render`. `RouterEntity`, `FormEntity` and the sensor entities take `id?: string` and any `type`. `@inglorious/web/test` has types, and the `lit-html` directives (`classMap`, `repeat`, …) are typed rather than `any`.
  - `I18nEntity`, `DataGridProps` and `VirtualListEntity` take `id?: string`; `ButtonProps`' `type` is optional. Component types (`RouterType`, `I18nType`, `LogoType`, …) are type aliases, which fit a store's `types`.
  - `withRealtime` accepts the type the store composes.
  - `@inglorious/react-store`'s `useEntity("form")` gives that entity's own type, and `useSelector` reads the app's state.

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.1.0

## 6.6.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.0.5
  - @inglorious/utils@5.0.0

## 6.6.1

### Patch Changes

- `api.render` accepts `undefined` in TypeScript, as it already did at runtime, so `api.render(router.route)` type-checks when no route matches.
- Updated dependencies
- Updated dependencies
  - @inglorious/store@11.0.4

## 6.6.0

### Minor Changes

- `mount` marks `<html>` with the `iw-native` class inside a Capacitor app, so CSS can tell the native app from a browser tab.

## 6.5.2

### Patch Changes

- Updated dependencies
  - @inglorious/utils@5.0.0
  - @inglorious/store@11.0.3

## 6.5.1

### Patch Changes

- Add "back" router event

## 6.5.0

### Minor Changes

- Enable view transitions

## 6.4.2

### Patch Changes

- Provide shortcut paths to common utils functions
- Updated dependencies
  - @inglorious/utils@4.0.0
  - @inglorious/store@11.0.2

## 6.4.1

### Patch Changes

- Add HMR Vite plugin
- Updated dependencies
  - @inglorious/store@11.0.1

## 6.4.0

### Minor Changes

- Add PWA and hybrid mobile support

## 6.3.0

### Minor Changes

- Add ElementSize type

## 6.2.0

### Minor Changes

- Add withDebounce decorator to web

## 6.1.2

### Patch Changes

- Fix accessing compass props asynchronously

## 6.1.1

### Patch Changes

- Simplify compass property naming

## 6.1.0

### Minor Changes

- Add compass type to web

## 6.0.0

### Major Changes

- Separate exports

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.0.0

## 5.0.2

### Patch Changes

- Fix Markdown pages being exported as default

## 5.0.1

### Patch Changes

- Fix Markdown hydration in SSX apps

## 5.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/store@10.0.0
  - @inglorious/utils@3.8.0

## 4.5.1

### Patch Changes

- Cleanup web package

## 4.5.0

### Minor Changes

- Create a design system and make web package leaner

## 4.4.0

### Minor Changes

- Support web component hydration in SSX

## 4.3.0

### Minor Changes

- Add i18n to SSX

## 4.2.5

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.6.0

## 4.2.4

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.3

## 4.2.3

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.2

## 4.2.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.1

## 4.2.1

### Patch Changes

- Remove remaining occurrences of allowType

## 4.2.0

### Minor Changes

- Remove allowTypes flag in favor of entity auto-creation

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.0

## 4.1.6

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.4.0

## 4.1.5

### Patch Changes

- Further decrease bundle size by dynamically importing SSR

## 4.1.4

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.3.1
  - @inglorious/utils@3.7.3

## 4.1.3

### Patch Changes

- Document Vue plugin on Web

## 4.1.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.3.0

## 4.1.1

### Patch Changes

- Add `autoCreateEntities` config option to store
- Updated dependencies
  - @inglorious/store@9.2.0

## 4.1.0

### Minor Changes

- Add and document the compute() function for derived state

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.1.0

## 4.0.11

### Patch Changes

- Better document table and list

## 4.0.10

### Patch Changes

- Document component libraries

## 4.0.9

### Patch Changes

- Clarify some points in Web's documentation

## 4.0.8

### Patch Changes

- Document testing in Inglorious Web

## 4.0.7

### Patch Changes

- Use standard render signature for sub-renders

## 4.0.6

### Patch Changes

- Update docs with web components info

## 4.0.5

### Patch Changes

- Add TSX web todomvc example
- Updated dependencies
  - @inglorious/store@9.0.1
  - @inglorious/utils@3.7.2

## 4.0.4

### Patch Changes

- Add Inglorious Web TS example

## 4.0.3

### Patch Changes

- Add JSX support

## 4.0.2

### Patch Changes

- Add SSX templates to create-app

## 4.0.1

### Patch Changes

- Make lazy route loading more robust

## 4.0.0

### Major Changes

- Consolidate route config and type changing

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.0.0

## 3.0.1

### Patch Changes

- Exclude tests from NPM package
- Updated dependencies
  - @inglorious/store@8.0.1
  - @inglorious/utils@3.7.1

## 3.0.0

### Major Changes

- Enable tree-shaking

## 2.6.1

### Patch Changes

- Notify lifecycle events as targeted
- Updated dependencies
  - @inglorious/store@8.0.0

## 2.6.0

### Minor Changes

- Add select type

## 2.5.0

### Minor Changes

- Add route guards

## 2.4.0

### Minor Changes

- Add lazy loaded routes feature

### Patch Changes

- Updated dependencies
  - @inglorious/store@7.1.4

## 2.3.0

### Minor Changes

- Add a client-server Inglorious Web demo

### Patch Changes

- Updated dependencies
  - @inglorious/store@7.1.3

## 2.2.3

### Patch Changes

- Improve web framework docs
- Updated dependencies
  - @inglorious/store@7.1.2

## 2.2.2

### Patch Changes

- Fix ESLint not included and remove reactive selectors

## 2.2.1

### Patch Changes

- e93d313: Return function from reactive selector to force re-renders

## 2.2.0

### Minor Changes

- Add reactive selectors

## 2.1.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/store@7.1.1
  - @inglorious/utils@3.7.0

## 2.1.0

### Minor Changes

- Add default, customizable renderer for web table

## 2.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@7.1.0

## 2.0.0

### Major Changes

- Rename @inglorious/lit into @inglorious/web

## 1.3.0

### Minor Changes

- Add list virtualization in @inglorious/web

## 1.2.1

### Patch Changes

- @inglorious/store@7.0.0

## 1.2.0

### Minor Changes

- Add basic router to @inglorious/web

## 1.1.0

### Minor Changes

- Add router type to @inglorious/web

## 1.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.2.1

## 7.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.2.0

## 6.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.1.3

## 6.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.1.2

## 6.0.1

### Patch Changes

- Add type safety
- Updated dependencies
  - @inglorious/store@6.1.1

## 6.0.0

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/store@6.1.0

## 5.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.0.1

## 5.0.0

### Major Changes

- Move all eager logic to store and devtools

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.0.0

## 4.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.5.0

## 3.0.2

### Patch Changes

- Lower default fps for apps

## 3.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.4.1

## 3.0.0

### Minor Changes

- Add eager mode by default on store

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.4.0

## 2.0.0

### Minor Changes

- Enable eager mode by default on store

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.3.0

## 1.0.2

### Patch Changes

- Fix notify function defined multiple times in react-store

## 1.0.1

### Patch Changes

- Fix peer dependencies in react store

## 1.0.0

### Major Changes

- Create react-store package

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.2.0
