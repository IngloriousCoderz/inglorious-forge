# @inglorious/ui

## 7.6.1

### Patch Changes

- Default outline buttons keep their text colour on hover. The hover turned it into the surface colour, which all but disappeared into the hover tint.
- Primary ghost and outline buttons show their hover again: the tint was mixed from the text colour of a filled primary button, white, and vanished on light backgrounds. It now comes from the primary colour, like every other colour's.

## 7.6.0

### Minor Changes

- The safe-area tokens are right in more places: in a browser tab the top inset is 0, even in browsers that report the status bar under their own toolbar (DuckDuckGo on Android), and in a Capacitor app on Android they use the insets Capacitor injects instead of doubling the status bar. `safe-area.css` is exported on its own for apps that don't import `base.css`.

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.6.0
  - @inglorious/charts@10.0.6

## 7.5.0

### Minor Changes

- `withTransitions` takes a `routes` option to choose which navigations animate: a list of route names animates every navigation into or out of one of them, and a function receives the direction and both sides of the navigation (path, history index, route) and returns whether to animate.

## 7.4.0

### Minor Changes

- The drawer header is as tall as an app bar and has its own inline padding, so the line under a drawer and an app bar beside it runs straight across, and a title no longer sits on the drawer's edge.

## 7.3.1

### Patch Changes

- Fix UI icon sizes

## 7.3.0

### Minor Changes

- Let surfaces take their colour from the theme:

  - Add the `--iw-app-bar-bg` and `--iw-drawer-bg` component tokens. Both default to `--iw-color-surface`, as before.
  - List items are transparent by default, and the selected tint is mixed over transparent, so a list shows the container it sits in (a drawer, a card, the page). Every built-in theme painted items in its surface colour, so lists on a surface look the same; a list placed straight on the page background now shows the page instead of surface-coloured boxes.

## 7.2.4

### Patch Changes

- Updated dependencies
  - @inglorious/utils@5.0.0
  - @inglorious/store@11.0.3
  - @inglorious/web@6.5.2
  - @inglorious/charts@10.0.5

## 7.2.3

### Patch Changes

- Add "back" router event
- Updated dependencies
  - @inglorious/web@6.5.1
  - @inglorious/charts@10.0.4

## 7.2.2

### Patch Changes

- Align input, select, and combobox look&feel

## 7.2.1

### Patch Changes

- Make combobox fully navigatable by keyboard

## 7.2.0

### Minor Changes

- Enable view transitions

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.5.0
  - @inglorious/charts@10.0.3

## 7.1.6

### Patch Changes

- Fix Combobox not listening to pointer events

## 7.1.5

### Patch Changes

- Fix Combobox not reopening dropdown

## 7.1.4

### Patch Changes

- Fix FAB paddings

## 7.1.3

### Patch Changes

- Fix FAB sizes

## 7.1.2

### Patch Changes

- Provide shortcut paths to common utils functions
- Updated dependencies
  - @inglorious/utils@4.0.0
  - @inglorious/store@11.0.2
  - @inglorious/web@6.4.2
  - @inglorious/charts@10.0.2

## 7.1.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.0.1
  - @inglorious/web@6.4.1
  - @inglorious/charts@10.0.1

## 7.1.0

### Minor Changes

- Improve hybrid mobile app creation

## 7.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.4.0
  - @inglorious/charts@10.0.0

## 6.1.0

### Minor Changes

- Add carousel and scollable flex

## 6.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.3.0
  - @inglorious/charts@9.0.0

## 5.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.2.0
  - @inglorious/charts@8.0.0

## 4.0.3

### Patch Changes

- Fix chart dots not showing correctly
- Updated dependencies
  - @inglorious/charts@7.0.3

## 4.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.2
  - @inglorious/charts@7.0.2

## 4.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.1
  - @inglorious/charts@7.0.1

## 4.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.1.0
  - @inglorious/charts@7.0.0

## 3.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.0.0
  - @inglorious/web@6.0.0
  - @inglorious/charts@6.0.0

## 2.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.2
  - @inglorious/charts@5.0.2

## 2.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.1
  - @inglorious/charts@5.0.1

## 2.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/web@5.0.0
  - @inglorious/utils@3.8.0
  - @inglorious/charts@5.0.0

## 1.0.2

### Patch Changes

- Allow easy override of composite primitives

## 1.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.5.1
  - @inglorious/charts@4.0.1

## 1.0.0

### Major Changes

- Create a design system and make web package leaner

### Patch Changes

- Updated dependencies
  - @inglorious/web@4.5.0
  - @inglorious/charts@4.0.0
