---
title: Entity Render Methods
description: Conditionals, lists, bindings, async state and refs in a render
---

# Entity Render Methods

`render(entity, api)` describes how an entity appears, as a lit-html template. It runs on every store update; lit-html does the rest.

## Conditionals and lists

```javascript
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

const TodoList = {
  render(entity, api) {
    return html`
      ${when(!entity.todos.length, () => html`<p>Nothing to do</p>`)}
      <ul>
        ${repeat(
          entity.todos,
          (todo) => todo.id,
          (todo) => html`
            <li @click=${() => api.notify(`#${entity.id}:todoToggle`, todo.id)}>
              ${todo.text}
            </li>
          `,
        )}
      </ul>
    `
  },
}
```

`repeat` keys the items, so reordering moves nodes rather than rewriting them; `map` is enough for a list that only changes in place.

## Bindings

```javascript
import { classMap } from "@inglorious/web/directives/class-map"
import { styleMap } from "@inglorious/web/directives/style-map"

html`
  <div
    class=${classMap({ item: true, active: entity.isActive })}
    style=${styleMap({ color: entity.color })}
  >
    <input
      type="checkbox"
      .checked=${entity.isChecked}
      ?disabled=${entity.isLocked}
      id=${entity.anchor || nothing}
    />
  </div>
`
```

`.prop` sets a property, `?attr` a boolean attribute, `@event` a listener, a bare name an attribute, and `nothing` omits one.

## Async state

A render shows the state a request left on the entity; it never starts one. `handleRequest` keeps `status` and `error`:

```javascript
import { handleRequest } from "@inglorious/store/async"

const Profile = {
  create(entity) {
    entity.status = "idle"
  },

  ...handleRequest("load", {
    run: (id) =>
      fetch(`/api/profiles/${id}`).then((response) => response.json()),
    success(entity, profile) {
      entity.profile = profile
    },
  }),

  render(entity, api) {
    if (entity.status === "loading") return html`<p>Loading...</p>`
    if (entity.status === "error") return html`<p>${entity.error}</p>`
    return html`<button @click=${() => api.notify(`#${entity.id}:load`, 1)}>
      Load
    </button>`
  },
}
```

## Derived data

Work beyond reading fields belongs in a handler, when the data changes, or in a selector memoized with `compute`, defined once outside the render. A `compute` created inside a render is a new memo every time, which memoizes nothing.

```javascript
import { compute } from "@inglorious/store"

const selectTotal = compute(
  (items) => items.reduce((sum, item) => sum + item.value, 0),
  [(state) => state.list.items],
)

render(entity, api) {
  return html`<p>Total: ${api.select(selectTotal)}</p>`
}
```

## Refs

`ref` hands you the element, for the few things only the DOM can do, such as moving focus. Elements are not state: keep them out of the entity.

```javascript
import { ref } from "@inglorious/web/directives/ref"

html`<input ${ref((element) => element?.focus())} />`
```
