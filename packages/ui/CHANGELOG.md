# @inglorious/ui

## 9.4.0

### Minor Changes

- `DataGrid` columns can be `type: "url"`: their cells show web addresses as links, opening in a new tab, and edit with a URL field; anything that is not an `http(s)` address stays text. A date column's editor gives dates back in the form the row keeps them, a `Date`, a timestamp or a `YYYY-MM-DD` string, keeping a time of day it had, and a date edited back to its saved day is no longer counted as a change.

  The two fields of a range filter fit in their column instead of spilling into the next one, and range columns are 160px wide by default.

## 9.3.0

### Minor Changes

- `DataGrid` cells can be edited. A column with `isEditable` puts an editor in each cell: a text, number or date field by its `type`, a checkbox for booleans, or a drop-down with the column's `options`. Edits are kept apart from the rows, in `edits`, through the `cellChange` event, and the footer counts them, with buttons to drop them (`editsReset`) or write them into the rows (`editsSave`); `saveLabel` renames the second. Sorting, filtering and search go by the saved values while edits are pending, and clicking an editor does not select its row. The `getCellValue`, `isCellEdited`, `getEditCount` and `getEditedRows` helpers read them. A grid rendered from props takes `onCellChange`, `onEditsReset` and `onEditsSave`, and no longer needs `sorts` or `filters`.

  Only sortable columns show sort arrows in their header. The types name a grid's rows `rows`, as the grid reads them, rather than `data`.

  `Input` takes an `ariaLabel`, naming a field with no visible label for assistive tech, as `Select` already does.

## 9.2.0

### Minor Changes

- Options can be picked from chips and cards. A `Chip` with `isSelected` is a toggle button, pressed while selected, that `onClick` toggles; without it, a chip is still a plain label. `RadioGroup` and `Checkbox` take `variant: "card"`, drawing each option as a card outlined while checked, in a grid for a radio group, and a `media`, such as an icon or an image, shown above the label. The inputs stay native radios and checkboxes.

## 9.1.1

### Patch Changes

- Templates render conditionally with `when()` from `@inglorious/web/directives/when` rather than ternaries and `&&`. Behaviour is unchanged, except that a condition that is a falsy number no longer renders a stray `0`.

## 9.1.0

### Minor Changes

- New optional props, so the components can show everything OpenUI's standard components describe:

  - `Card` takes a `variant`: `"default"`, `"sunk"` into the page, or `"clear"` without a surface.
  - `Alert` has a `"neutral"` severity.
  - `Chip` takes an `icon`, shown before its label.
  - `Button` has an `"xs"` size.
  - `Divider` takes `isDecorative`, hiding it from assistive tech; a vertical one says so with `aria-orientation`.
  - `Dialog` takes a `size`: `"sm"`, `"md"` or `"lg"`.
  - `Checkbox`, `Switch` and each `RadioGroup` option take a `description`, shown under the label.
  - `Slider` takes a `[low, high]` value for a range with two thumbs, and `hasMarks` for a tick at every step.
  - `Flex` takes gaps `"xs"` and `"2xl"`.

### Patch Changes

- `Accordion` reads whether an item opened from the element itself when the `toggle` event does not say, as in jsdom, so tests of apps using it see the item open.

## 9.0.0

### Major Changes

- Components use the browser's own features where it has them, instead of rebuilding them in JavaScript.

  - `Dialog` is a native `<dialog>`, opened with `showModal()`: the browser traps focus, makes the page inert, closes on Esc and returns focus to the trigger. It stays in the page while closed. `isModal: false` shows it in place instead. The backdrop is `.iw-dialog::backdrop`, and `.iw-dialog-backdrop` is gone. With `id`, the dialog is labelled by its title and described by its description.
  - `Drawer` overlays the page as a native popover, over a `::backdrop`, and closes on Esc or a press outside it. It no longer renders a `Backdrop`, so `.iw-drawer-backdrop` is gone. `variant` now works: `responsive` (the default) docks from 64rem and overlays below it, `temporary` overlays at every width, `permanent` never does. `breakpoint` and the `persistent` variant, which never did anything, are removed. Without `onClose` the drawer cannot be dismissed by the browser.
  - `Progress`: the linear bar is a native `<progress>`. `.iw-progress-linear-track` and `.iw-progress-linear-bar` are gone: set `color`, `--iw-progress-height`, `--iw-progress-radius` and `--iw-progress-track-color` instead. The circle is a `progressbar` with its value, and both take `ariaLabel`.
  - `Rating` is a fieldset of native radios: arrow keys move between the stars, and the value submits with a form under `name` (or `id`). Takes `ariaLabel`.
  - `Accordion` items are `<details>` with a `<summary>` trigger. Items sharing the new `name` close each other. Changes the browser makes, such as find-in-page opening an item, reach `onToggle` and `onItemToggle`.
  - `Menu` takes a `trigger`: it then renders a button that opens the menu as a popover anchored to it, which flips to stay on screen and closes on Esc, a press outside or a pick. `onToggle` keeps the store in step. Needs an `id`.
  - `SpeedDial` actions are a popover anchored to the trigger on the side `direction` names, closing on Esc, a press outside or an action. `onToggle` now reports the browser's changes; without it the browser alone keeps the open state.
  - `Combobox`, `Tooltip` and `Snackbar` are positioned by the browser: the combobox list is a popover anchored under its field, the tooltip bubble is anchored to its trigger and flips when there is no room, and the snackbar is a popover. None of them is cut off by a container that clips its overflow any more, and the snackbar shows above an open modal dialog.
  - `Tabs` move with the arrow keys, Home and End, with only the selected tab in the Tab order. With `id`, each tab and its panel are linked.
  - `Switch` is announced as a switch. `Button` only sets `aria-pressed` and `aria-label` when given.

## 8.6.0

### Minor Changes

- Button: add `onFileSelect`, `accept` and `isMultiple` to turn a button into a file picker. FileUpload: keep the pointer cursor over the whole drop area.

## 8.5.0

### Minor Changes

- `Snackbar` takes `position: "bottom-center"` and `"top-center"`, and keeps clear of the system bars: the home indicator at the bottom, the status bar at the top. Set `--iw-snackbar-offset-bottom` to the height of a bar the app keeps at the bottom, such as a `BottomNavigation`, while it shows, and a bottom snackbar rises above it.

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.9.0

## 8.4.2

### Patch Changes

- Relative imports name the file they import, such as `../../controls/button/index.js` rather than `../../controls/button`. Since 8.4.1, `Drawer`, `List` and the `DataGrid` filters could only be imported through a bundler: Node refused the directory imports, so a test or script that loaded them outside Vite failed.
- @inglorious/store@12.0.0
  - @inglorious/utils@5.1.0
  - @inglorious/web@6.8.1

## 8.4.1

### Patch Changes

- Source files read top-down: the functions a module exports come first, and the helpers they use are defined below them. Modules import other files of their own package by relative path rather than by the package's name. Behaviour is unchanged.
- Updated dependencies
- Updated dependencies
  - @inglorious/store@12.0.0
  - @inglorious/utils@5.1.0
  - @inglorious/web@6.8.1

## 8.4.0

### Minor Changes

- Fix how form controls tie labels, ids and messages together, so every control works without an `id`:

  - `Switch` and `Checkbox` without an `id` toggle from their label again. They rendered `for=""`, which points at nothing and broke the click-through even though the label wraps the input.
  - `Checkbox` color variants reach the checkbox. The input shared the root's `iw-checkbox` class and reset the accent color on itself; it is now `iw-checkbox-input`, like `iw-switch-input`.
  - `RadioGroup` gives each option its own id (`<name-or-id>-<index>`) instead of one id for all, and groups its radios by `id` when no `name` is given.
  - `FileUpload` no longer falls back to the id `"file-upload"`, which two uploads on one page would share.
  - `Input` no longer leaks `label`, `hint` and `isFullWidth` onto the `<input>` as attributes.
  - No control renders an empty `id=""` or `for=""` any more. Without an id, `Input`, `Select`, `Textarea`, `Slider`, `FileUpload` and `Combobox` take a plain-text `label` as their `aria-label`, so they are still announced.
  - With an id, `Input`, `Select`, `Textarea` and `FileUpload` point at their hint or error (`<id>-message`) with `aria-describedby`, and state `aria-invalid` as `"true"` or `"false"`.

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.8.0

## 8.3.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/web@6.7.2
  - @inglorious/store@11.3.0

## 8.3.0

### Minor Changes

- Add `ImageCropper`: a movable, resizable crop frame over a whole image, free or locked to an aspect ratio. Drag to move or resize, pinch or scroll to scale, and use the keyboard (arrows move, Shift+arrows resize, +/- scale, Home resets). The frame is kept in image fractions, and `cropImage(file, rect, options)` crops and encodes the result in the browser.

## 8.2.5

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.2.0
  - @inglorious/web@6.7.1

## 8.2.4

### Patch Changes

- Fix UI list item spacings

## 8.2.3

### Patch Changes

- Types follow the store's: an entity drawn by a library type extends its entity interface, such as `interface AppRouterEntity extends RouterEntity { type: "Router" }`, and the type registers under any name with no cast.

  - `@inglorious/web`'s `Api` is the store's, which loading web's types gives a `render`. `RouterEntity`, `FormEntity` and the sensor entities take `id?: string` and any `type`. `@inglorious/web/test` has types, and the `lit-html` directives (`classMap`, `repeat`, …) are typed rather than `any`.
  - `I18nEntity`, `DataGridProps` and `VirtualListEntity` take `id?: string`; `ButtonProps`' `type` is optional. Component types (`RouterType`, `I18nType`, `LogoType`, …) are type aliases, which fit a store's `types`.
  - `withRealtime` accepts the type the store composes.
  - `@inglorious/react-store`'s `useEntity("form")` gives that entity's own type, and `useSelector` reads the app's state.

- Updated dependencies
- Updated dependencies
  - @inglorious/web@6.7.0
  - @inglorious/store@11.1.0

## 8.2.2

### Patch Changes

- - An app's own `Api<AppEntity, AppState>` is accepted wherever the plain `Api` is, so passing it to `Chart.render`, `DataGrid.render` and the like no longer needs a cast. Event handlers in `EntityType` are checked as methods are, and `createStore` no longer infers the entity type from `types`.
  - UI component types (`ButtonType`, `DataGridType`, …) are type aliases rather than interfaces, so they fit a store's `types` as `ChartType` does.
  - `@inglorious/ui` declares its components for TypeScript at the root too: `import { Button } from "@inglorious/ui"` typechecks.
- - `DataGrid`'s types declare `DataGrid` and its helpers (`getRows`, `getTotalRows`, `getPaginationInfo`, `getSortDirection`, `isAllSelected`, `isSomeSelected`), which TypeScript could not import before.
  - A default `Chip` reads `--iw-chip-bg`. The Material theme sets it to a tint of the text, so the chip shows on white surfaces, and chip labels stay on one line.
  - With `isWrapping`, `Table` wraps cells between words, breaking a word only when it cannot fit alone, so short values such as percentages stay whole.
  - The Material theme follows Material UI more closely: a button's default color is primary (through the new `--iw-button-default-*` tokens), and button and tab labels are medium weight (`--iw-label-font-weight`) with Material UI's letter spacing.
- Updated dependencies
  - @inglorious/store@11.0.5
  - @inglorious/web@6.6.2
  - @inglorious/utils@5.0.0

## 8.2.1

### Patch Changes

- `VirtualList` no longer freezes the page when it mounts. It measured its first item in a microtask on every render, and measuring re-renders, so a list not yet in the document looped forever; it then measured 0 and rendered every item. It now measures once, after a frame and once the list is in the document, and keeps its estimated height when it measures 0.

## 8.2.0

### Minor Changes

- - Linear `Progress` applies `color`, as the circular variant already did.
  - `Button`, `IconButton`, `ButtonGroup` and `Fab` types accept `color: "default"`, their runtime default.
  - `Tooltip`'s `onClick` is optional.
  - `Tabs` accepts `value: null` for no tab selected.
  - `Table` takes `isWrapping`, which wraps cell content to fit its container instead of scrolling.
  - Buttons and tabs read `--iw-label-text-transform` and `--iw-label-letter-spacing`; the Material theme sets their labels in capitals.

### Patch Changes

- @inglorious/store@11.0.4
  - @inglorious/utils@5.0.0
  - @inglorious/web@6.6.1

## 8.1.1

### Patch Changes

- `@inglorious/charts` is no longer a peer dependency: only the dashboard example and the playground use it, so installing Inglorious UI no longer pulls in or warns about the charts package.

## 8.1.0

### Minor Changes

- 8e437e4: - The theme classes paint the element they are on, usually `<body>`: its background, text color and font come from the theme's tokens, so an app no longer writes those rules itself.
  - The app bar has inline padding, so its title and controls no longer touch the edges of the screen.

### Patch Changes

- `Select` takes an `ariaLabel` prop, which names the control for assistive tech when it has no visible label. Also fixed: a select with a `name` and no `id` binds its label to that name.
- e026829: `withTransitions` is typed as returning the store it was given, so in TypeScript its result can be passed to `mount`.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @inglorious/store@11.0.4
  - @inglorious/web@6.6.1
  - @inglorious/charts@10.0.7

## 8.0.0

### Major Changes

- Icons are SVG:

  - `Icon` takes `icon`, an icon from any Iconify set (`import arrowBack from "@iconify-icons/material-symbols/arrow-back"`), and draws it as inline SVG one em square. No icon font is loaded, and only the icons an app imports are bundled. It also takes `direction`, to mirror an icon that points along the line in right-to-left text, and `label`, for an icon that means something on its own.
  - `MaterialIcon` is removed. `MaterialIcon.render({ name: "arrow_back" })` becomes `Icon.render({ icon: arrowBack })` with the icon imported from `@iconify-icons/material-symbols`; the outlined look is the `-outline` icon. `@inglorious/ui/material-icon.css` is gone too.
  - The drawer draws its close and collapse icons itself, so it needs no icon font.

### Patch Changes

- Bottom navigation labels are 12px, as Material sizes them, and tabs have narrower sides, so labels such as "Applications" or "Candidatures" fit a quarter of a 360px phone instead of being cut short.

## 7.8.1

### Patch Changes

- Fix text sizes in Avatar component

## 7.8.0

### Minor Changes

- Right-to-left support:

  - The drawer, app bar, list, menu, alert, divider, container, input, select, textarea, combobox and button group use logical properties, so they mirror in a right-to-left page. A `left` drawer sits at the start of the line: on the right in Arabic.
  - `--iw-dir-sign` is `1` in left-to-right and `-1` in right-to-left, for anything that moves sideways. The drawer, page transitions and switch use it, so they slide the mirrored way.
  - `MaterialIcon` takes `direction` (`"ltr"` by default, or `"rtl"`): an icon that points along the line, such as a back arrow, is mirrored in right-to-left text. The drawer's collapse toggle mirrors with the page.

## 7.7.0

### Minor Changes

- - Bottom navigation labels stay on one line and are cut short with an ellipsis when too long, instead of wrapping: in Japanese or Chinese a wrap split a word and made the bar taller.
  - `Combobox` takes `searchPlaceholder` for the search box in its panel, so it can be translated. It still defaults to "Search...".

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
