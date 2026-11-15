---
name: ui
description: "@inglorious/ui: props-first components, Iconify icons, themes (Inglorious, Material UI, Material 3, Bootstrap, iOS 18/26) with light/dark, CSS tokens, page transitions."
---

# @inglorious/ui

Conventions: [ui-best-practices](../ui-best-practices/SKILL.md), [web-best-practices](../web-best-practices/SKILL.md).

```javascript
import "@inglorious/ui/base.css"; // reset, tokens, safe areas
import "@inglorious/ui/themes/inglorious.css"; // material-ui, material-3, bootstrap, ios-18, ios-26
import "@inglorious/ui/button.css"; // per component, per category (controls.css, layout.css, ...), or all.css
```

`<body class="iw-theme-inglorious iw-theme-light">` (or `iw-theme-dark`).

Components are stateless objects of render methods: `Button.render(props)`, events as `onX` callbacks, overridable sub-renderers. Entities hold data only; a type wraps the render and turns callbacks into notifies:

```javascript
import { Button } from "@inglorious/ui/button";

const SubmitButton = {
  render(entity, api) {
    return Button.render({ ...entity, onClick: () => api.notify(`#${entity.id}:click`) });
  },
  click(entity) {
    entity.isPressed = !entity.isPressed;
  },
};
```

## Components

- **Button**: `children`, `variant` `default|outline|ghost`, `color` `default|primary|secondary|success|warning|error|info`, `size` `xs|sm|md|lg`, `shape` `rectangle|pill|round|square`, `isDisabled`, `isPressed`, `isFullWidth`, `buttonType`, `href` (renders `<a>`), `onClick`, `onFileSelect(files)` + `accept`, `isMultiple` (file picker; never overlay an `<input type="file">`). `IconButton`, `ButtonGroup`, `Fab` share `color`. Default color comes from the theme; set `color` only to depart from it.
- **Input**: `id`, `name`, `label`, `inputType` (`type` is the entity's), `value`, `placeholder`, `hint`, `error`, `size`, `isDisabled`, `isReadOnly`, `isRequired`, `isFullWidth`, `icon`, `iconAfter`, `ariaLabel`, `onChange(value)`.
- **Card**: `title`, `subtitle`, `header`, `children`/`body`, `footer`, `headerPadding`/`bodyPadding`/`footerPadding`, `element` (`article`), `variant` `default|sunk|clear`, `isHoverable`, `isClickable`, `isFullWidth`, `onClick`; override `renderHeader`/`renderBody`/`renderFooter`.
- **Table**: columns `{ id, label, align }`, rows keyed by column id, scrolls unless `isWrapping`. Override `renderCell(props, { column, row })`.
- **DataGrid**: `isEditable` columns (edits in `edits`; `cellChange`, `editsReset`, `editsSave`; props `onCellChange`, `onEditsReset`, `onEditsSave`; `getEditCount`, `getEditedRows`). Server mode: set `totalRows` and wrap `pageChange`, `pageNext`, `pagePrev`, `pageSizeChange`, `sortChange`, `filterChange`, `searchChange` to fetch after calling `DataGrid.<handler>`. ARIA grid with keyboard selection; name it with `ariaLabel`.
- **Combobox** (entity): grouped options `{ label, options }` (never disabled options as headings), themed via `--iw-input-*`; `changeEvent` + `changePayload` notify `{ ...changePayload, value }`; events `valueSet`, `optionsSet`, `errorSet`.
- **Chat** (`@inglorious/ui/chat`): messages `{ id, role, content }` or `{ id, role, entity }`; events `draftChange`, `messageSend`, `messageAdd`, `replyStart`, `replyEnd`, `replyFail`, `messagesClear`; answer via `Chat: [Chat, withAssistant]` wrapping `messageSend`; `suggestions`, `isBusy`.
- **ConfirmDialog**: `message`, `confirmLabel`, `cancelLabel`, `busyLabel`, `tone` `danger|primary`, `isBusy`, `children`.
- **LoadStatus**: `isError`+`error`, `isLoading` (`loadingLabel`, `loader`), `isEmpty`+`emptyText`, else `content()`.
- **ChipPicker**: `label`, `options`, `value`, `onToggle(value)`.
- **CropDialog**: `cropperId`, `onApply(rect)`, `error`, `loadErrorText`; `render(props, api)`.
- **Lightbox**: `images`, `index`, `onStep(±1)`, `onClose`.
- **Dialog**: `size`, `variant` `dialog|sheet`, `closeLabel`. Below 48rem a sheet with `onClose` gets a handle and closes when dragged down (past 30% or flicked) from the handle or header. With the `Keyboard` type from `@inglorious/web/device/keyboard` in the store, sheets, Snackbar and Toast sit above the on-screen keyboard and BottomNavigation hides while it's up.
- **ActionSheet**: `title`, `message`, `actions` `[{ label, icon?, color?, isDisabled?, onClick }]` (`color: "error"` for destructive), `cancelLabel`, `onClose`; picking an action runs `onClick` then `onClose`.
- **PullToRefresh**: wraps content; `onRefresh` when pulled past 64px from scroll top and released, `isRefreshing` holds the spinner, `isDisabled`, `refreshingLabel`; ticks with `haptics.selection()` from `@inglorious/web/device/haptics` when it arms. Touch only: offer a button on desktop. **Drawer**: `closeLabel`, `collapseLabel`, `expandLabel`.
- **Snackbar**: `position` (`bottom-left` default, `top-*`, `bottom-*`); close button only with `onClose`; lift above bottom bars with `--iw-snackbar-offset-bottom`.
- **Toast**: entity type `{ type: "Toast", max? }` (default 3); `api.notify("#toasts:show", { message, title?, color?, icon?, duration?, ...extra })` (newest on top, id assigned), `close(id)`, `clear()`. Extend with an `open(entity, id, api)` handler to make toasts clickable (extra fields like a path stay on the toast). Props mode: `Toast.renderToaster({ toasts, position, duration, onClose, onClick })`; `onClose(id)` fires after the exit animation (button or timeout; hover pauses).
- **Slider**: `[low, high]` for ranges, `hasMarks`. **Progress**: `linear|circular`, indeterminate without `value`. **Tabs**: `value` (`null` for none).
- **Avatar**: `src` or `initials`, `size` `sm|md|lg|xl|2xl`; `alt` names the picture or initials, `""` hides it beside a visible name. **Chip**: `icon`, `isSelected` toggles. **RadioGroup**/**Checkbox**: `variant: "card"`, `media`, `description` (also Switch). **Alert**: `neutral` severity. **Divider**: `isDecorative`. **Textarea**: `onKeyDown`, `ariaLabel`.
- All visible/announced text is a prop with an English default; counts are `format…(…)` functions (1-based).

## Form controls

- Checkbox, Switch, RadioGroup wrap their input in the label.
- Input, Select, Textarea, Slider, FileUpload, Combobox need an `id` (or `name`) to tie the label; otherwise the label becomes `aria-label`.
- Messages get `<id>-message` and `aria-describedby`; `aria-invalid` is always set.
- RadioGroup needs `name` or `id`.

## Icon

```javascript
import { Icon } from "@inglorious/ui/icon";
import arrowBack from "@iconify-icons/material-symbols/arrow-back";

Icon.render({ icon: arrowBack, size: "lg", direction: api.getEntity("i18n").dir, label: "Back" });
```

Any Iconify set, inline SVG. `size` `sm|md|lg|xl|2xl`. Material Symbols: plain name filled, `-outline`, `-rounded`, `-sharp`. Icon data is plain data. Decorative unless `label`.

## Page transitions

```javascript
import { withTransitions } from "@inglorious/ui/view-transitions";

middlewares: [withTransitions({ routes: ["jobDetail", ...tabs], direction: ({ type, from, to }) => type })];
```

Needs the web `Router`; skipped under reduced motion. `from`/`to` have `path`, `index`, `route`. Give fixed bars unique `view-transition-name`s; a duplicate name aborts every transition.

## Theming

- Tokens: `--iw-color-*`, `--iw-space-*`, `--iw-radius-*`, `--iw-font-*`, and per component (`--iw-button-*`, `--iw-input-*`, `--iw-card-*`).
- Roles (`primary`, `secondary`, `success`, `warning`, `error`, `info`): `--iw-color-{role}` fill, `-hover`/`-active`, `-text` (text on the fill), `-emphasis` (the role as text or outline on the page). A custom theme overriding a role sets all of them, each pair at AA (4.5:1).
- Labels: `--iw-label-text-transform`, `--iw-label-letter-spacing`, `--iw-label-font-weight`. Chips: `--iw-chip-bg`.

## Writing components

- `id=${id || nothing}`: never render empty `id`/`for`.
- Flat `iw-` classes nested under the root; children get their own class.
- Tests: `render` from `@inglorious/web/test`; append to `document.body` for label clicks in jsdom; store wiring via `createMockApi` and `api.getEvents()`.
