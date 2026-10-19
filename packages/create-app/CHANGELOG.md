# @inglorious/create-game

## 1.4.0

### Minor Changes

- TypeScript apps type themselves with no casts: `types/index.d.ts` declares each type's events and payloads as a `type` alias (`MessageType`), types are written `const Message: MessageType = { ... }`, and the store takes `types: { Message }`. `AppType<TEntity>` is exported as a shorthand, for `{ ... } satisfies AppType<MessageEntity>`. The PWA registration references only `vite-plugin-pwa/vanillajs`, whose typings do not replace JSX's.

## 1.3.0

### Minor Changes

- - The project name can be passed as the first argument, and the template and syntax as `--template` and `--syntax`, so a project can be created without any prompt.
  - TypeScript templates install `typescript` as TypeScript 6 (`@typescript/typescript6`) and TypeScript 7 as `@typescript/native`: TypeScript 7 has no JavaScript API, which typescript-eslint and the Capacitor CLI need. `tsc` is still TypeScript 7.
  - Fix a lint warning in the TSX template and a type error in the TypeScript Vue template.

## 1.2.0

### Minor Changes

- bae1af1: The CLI asks about the app's features: Inglorious UI and its theme, a mobile app, routing, page transitions, icon packs (Material Symbols, Font Awesome, Lucide) and translation into several languages, with a flag for each. For lit-html apps it generates the matching source: an app shell, pages, routes, a store, catalogues and a language picker, in JavaScript or TypeScript, already formatted and lint-clean. PWA projects no longer come out with misformatted `vite.config` and `main` files.
- df12e37: The app's features are generated for JSX and Vue too, not only lit-html: the same app shell, pages, store, catalogues and icons, written in the syntax chosen. Also fixed: mobile support no longer replaces a TypeScript template's own `typescript` version, and the TSX template imports its types from the right path.

### Patch Changes

- Fixes to the generated apps:

  - The store creates the app's singletons (pages, router, i18n) with `autoCreateEntities`, so `entities` only lists the messages.
  - The language picker is named for assistive tech through `Select`'s `ariaLabel`.
  - In TSX, the language picker's and the tabs' `onChange` parameters are typed instead of `any`.
  - JSX uses `className` and keys the language options, so JavaScript JSX apps pass the React lint rules.
  - Pages no longer declare an `entity` parameter they do not use, which failed lint.
  - TypeScript Vue apps type their middlewares, and their ESLint config no longer tries to parse `.vue` files.
  - TypeScript templates depend on `jiti`, which ESLint needs to load `eslint.config.ts`; it used to come only with PWA support.
  - Vite configs include `@inglorious/vite-plugin-hmr`, which the apps already depended on but did not use.
  - SSX apps build: they depend on `@inglorious/store`, which their client bundle imports, and TypeScript ones on `typescript`. Their config sets the favicon to the logo, and the JavaScript one's type annotation points at `@inglorious/ssx`.
  - Mobile apps add `capacitor.config.ts` to `tsconfig.node.json`, so it is type-checked and linted.
  - Templates use the latest version of every dependency, among them TypeScript 7, Vite 8.3, vite-plugin-pwa 2, Capacitor 8.5.3 and, for SSX, KaTeX 0.19, Mermaid 12 and markdown-it 15. `@types/node` stays on Node 22, the oldest version the apps support.
  - Generated TypeScript passes TypeScript 7's default `strict` mode: the native language picker's change handler is typed, and optional entity fields are checked.

## 1.1.2

### Patch Changes

- Add HMR Vite plugin

## 1.1.1

### Patch Changes

- Improve hybrid mobile app creation

## 1.1.0

### Minor Changes

- Add PWA and hybrid mobile support

## 1.0.2

### Patch Changes

- Fix Markdown hydration in SSX apps

## 1.0.1

### Patch Changes

- Fix entity binding in Vue plugin

## 1.0.0

### Major Changes

- Use PascalCase for type names

## 0.5.1

### Patch Changes

- Improve scaffolded apps and docs

## 0.5.0

### Minor Changes

- Add Vue support in app scaffolder

## 0.4.0

### Minor Changes

- Allow JSX syntax when scaffolding app

## 0.3.5

### Patch Changes

- Add TSX web todomvc example

## 0.3.4

### Patch Changes

- Fix TypeScript errors on scaffolded TS project

## 0.3.3

### Patch Changes

- Add Inglorious Web TS example

## 0.3.2

### Patch Changes

- Fix SSX site config type import

## 0.3.1

### Patch Changes

- Fix TS support in SSX and upgrade Storybook

## 0.3.0

### Minor Changes

- Add SSX templates to create-app

## 0.2.2

### Patch Changes

- Add missing Vite preview scripts

## 0.2.1

### Patch Changes

- Minify template literals for better client-side performance

## 0.2.0

### Minor Changes

- Create new Inglorious Logo package

## 0.1.2

### Patch Changes

- Fix ESLint not included and remove reactive selectors

## 0.1.1

### Patch Changes

- Add minimal app template

## 0.1.0

### Minor Changes

- Add app scaffolding tool

## 1.0.5

### Patch Changes

- Fix game scaling on mobile devices

## 1.0.4

### Patch Changes

- Add eager mode by default on store

## 1.0.3

### Patch Changes

- Create react-store package

## 1.0.2

### Patch Changes

- Support eager and lazy loading of images

## 1.0.1

### Patch Changes

- Show spinner while scaffolding game

## 1.0.0

### Major Changes

- Create game scaffolding tool
