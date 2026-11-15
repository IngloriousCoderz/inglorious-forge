---
name: web-best-practices
description: Folder layout, component shape, styling and typing conventions for Inglorious Web apps and libraries.
---

# Web Best Practices

## App layout

```
src/
├── main.js
├── app/          # shell and its own pieces (tab-bar/, ...)
├── views/        # only with a router: one folder per screen
│   └── home/
│       └── message/   # a piece lives with what renders it
├── common/       # pieces rendered in more than one place
├── api/
├── store/        # entities, middlewares, routes
└── styles/
types/            # TS type definitions only
```

- Group by where code belongs, not by store wiring. One screen: no `views/`, it lives in `app/`.
- Move a piece to `common/` once a second place renders it.
- No code folder named `types/` or `components/`.
- Libraries group by intent once large: `controls/`, `layout/`, `content/`, `widgets/`.

## Component folder

`button/`: `index.js`, `template.js` (once there is logic), `style.module.css` (app) or `style.css` (library), optional `handlers.js`, `helpers.js`, `button.stories.js`, `button.test.js`. Omit absent files.

- Presentational: `index.js` holds the component.
- With logic: markup moves to `template.js` (exports `template`), `index.js` spreads it with handlers. Never a `template.js` without `index.js`, nor an `index.js` that only forwards it.

## Component shape

- An object of render methods, never arrows: `export const Button = { render(props) {...} }`.
- Siblings are called through `this` so spread-overrides work. Never call `template.render(...)` from `index.js`.
- Render signatures: `render(props, api)`; item sub-renderers `renderX(props, ownProps, api)`, never `{ ...props, row }`. `api` last, only to render children (`api.render(id)`). App mounts with `App.render(null, api)`.
- Templates take data and `onX` callbacks; never `api.notify`/`getEntity`/`select`. Exception: base types rendering their own entity (`AgGrid`, `VirtualList`).
- `index.js`'s `render(entity, api)` shadows the template's, so the template keeps its markup in a base renderer named after the component, and `render` never calls `this.render()`. Same for any redefined renderer (`renderHeader` → template's `renderNotificationsHeader`).

```javascript
// combobox/template.js
export const template = {
  render(props) {
    return this.renderCombobox(props);
  },
  renderCombobox(props) {
    return html`<div class="iw-combobox">${this.renderControl(props)}</div>`;
  },
  renderControl(props) {},
};

// combobox/index.js
export const Combobox = {
  ...handlers,
  ...template,
  render(entity, api) {
    return this.renderCombobox({ ...entity, onToggle: () => api.notify(`#${entity.id}:toggle`) });
  },
};
```

- A store-reading piece with no state of its own is not an entity: same split, `render(props, api)` reads the store, parent calls `Scoreboard.render(null, api)`. True local state: a web component.
- Conditionals use `when()` from `@inglorious/web/directives/when`; attribute values keep `cond ? value : nothing`.

## Styling

- Apps: CSS modules. Libraries: global `style.css`, flat `iw-` classes (`iw-button-outline`, `iw-button-icon`, no BEM), nested under one root selector, tokens over literals.
- Primitive tokens in `tokens/index.css`; component tokens scoped to theme classes (`.iw-theme-material-3`), modes to combined classes (`.iw-theme-material-3.iw-theme-dark`), never `:root`.

## Stories and tests

- Stories: args-driven single instance, `Default` as playground; disable controls on multi-instance stories.
- Tests: DOM output, modifiers, optional slots, and events through `api.notify()`.

## Types (TypeScript)

- `types/index.d.ts`: `AppEntity`, `AppState`, `AppApi`, `type AppEvents = EventsOf<DebateType | RouterType>`.
- One file per piece: `types/scoreboard.d.ts` with `ScoreboardProps`, `ScoreboardTemplate`.
- `template.js` is typed `ScoreboardTemplate & ThisType<ScoreboardTemplate>`.
- Store-wired types with prop templates: `defineType<ScoreboardEntity, AppApi>()({ ...template, render })` from `@inglorious/store`.
- Published packages ship `types/<name>.d.ts` matching runtime.
