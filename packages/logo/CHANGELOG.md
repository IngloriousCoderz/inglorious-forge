# @inglorious/logo

## 3.0.25

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.10.0

## 3.0.24

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.9.1

## 3.0.23

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.9.0

## 3.0.22

### Patch Changes

- @inglorious/web@6.8.1

## 3.0.21

### Patch Changes

- Rename the face images to kebab-case (`a.svg` to `z.svg`). Faces are still chosen by letter, so nothing changes for users.
- Updated dependencies
  - @inglorious/web@6.8.0

## 3.0.20

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.7.2

## 3.0.19

### Patch Changes

- @inglorious/web@6.7.1

## 3.0.18

### Patch Changes

- Types follow the store's: an entity drawn by a library type extends its entity interface, such as `interface AppRouterEntity extends RouterEntity { type: "Router" }`, and the type registers under any name with no cast.

  - `@inglorious/web`'s `Api` is the store's, which loading web's types gives a `render`. `RouterEntity`, `FormEntity` and the sensor entities take `id?: string` and any `type`. `@inglorious/web/test` has types, and the `lit-html` directives (`classMap`, `repeat`, …) are typed rather than `any`.
  - `I18nEntity`, `DataGridProps` and `VirtualListEntity` take `id?: string`; `ButtonProps`' `type` is optional. Component types (`RouterType`, `I18nType`, `LogoType`, …) are type aliases, which fit a store's `types`.
  - `withRealtime` accepts the type the store composes.
  - `@inglorious/react-store`'s `useEntity("form")` gives that entity's own type, and `useSelector` reads the app's state.

- Updated dependencies
  - @inglorious/web@6.7.0

## 3.0.17

### Patch Changes

- @inglorious/web@6.6.2

## 3.0.16

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.1

## 3.0.15

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.0

## 3.0.14

### Patch Changes

- @inglorious/web@6.5.2

## 3.0.13

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.1

## 3.0.12

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.0

## 3.0.11

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.2

## 3.0.10

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.1

## 3.0.9

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.0

## 3.0.8

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.3.0

## 3.0.7

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.2.0

## 3.0.6

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.2

## 3.0.5

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.1

## 3.0.4

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.0

## 3.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.0.0

## 3.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.2

## 3.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.1

## 3.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.0

## 2.1.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.5.1

## 2.1.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.5.0

## 2.1.0

### Minor Changes

- Allow for custom types and entities in SSX

## 2.0.36

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.4.0

## 2.0.35

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.3.0

## 2.0.34

### Patch Changes

- @inglorious/web@4.2.5

## 2.0.33

### Patch Changes

- @inglorious/web@4.2.4

## 2.0.32

### Patch Changes

- @inglorious/web@4.2.3

## 2.0.31

### Patch Changes

- @inglorious/web@4.2.2

## 2.0.30

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.2.1

## 2.0.29

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.2.0

## 2.0.28

### Patch Changes

- @inglorious/web@4.1.6

## 2.0.27

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.1.5

## 2.0.26

### Patch Changes

- Decrease bundles size
  - @inglorious/web@4.1.4

## 2.0.25

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.1.3

## 2.0.24

### Patch Changes

- @inglorious/web@4.1.2

## 2.0.23

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.1.1

## 2.0.22

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.1.0

## 2.0.21

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.11

## 2.0.20

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.10

## 2.0.19

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.9

## 2.0.18

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.8

## 2.0.17

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.7

## 2.0.16

### Patch Changes

- Make logo SSX-friendly

## 2.0.15

### Patch Changes

- Fix directory import in logo

## 2.0.14

### Patch Changes

- Fix missing extensions in logo imports

## 2.0.13

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.6

## 2.0.12

### Patch Changes

- Add TSX web todomvc example
- Updated dependencies
  - @inglorious/web@4.0.5

## 2.0.11

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.4

## 2.0.10

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.3

## 2.0.9

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.2

## 2.0.8

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.1

## 2.0.7

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.0.0

## 2.0.6

### Patch Changes

- Exclude tests from NPM package
- Updated dependencies
  - @inglorious/web@3.0.1

## 2.0.5

### Patch Changes

- Enable tree-shaking
- Updated dependencies
  - @inglorious/web@3.0.0

## 2.0.4

### Patch Changes

- Notify lifecycle events as targeted
- Updated dependencies
  - @inglorious/web@2.6.1

## 2.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/web@2.6.0

## 2.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@2.5.0

## 2.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@2.4.0

## 2.0.0

### Major Changes

- Create new Inglorious Logo package
