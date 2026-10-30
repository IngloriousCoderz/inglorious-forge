---
title: Where State Lives
description: Application state in the store, and what stays with the browser - input, hover, focus, animations and gestures
---

# Where State Lives

Inglorious Web has no component state. That doesn't mean everything goes in the store: it means everything that **matters** goes in the store, and what only lasts for the length of one interaction stays where the browser already keeps it.

The rule of thumb is this: if something must still be true once the interaction is over, or anything else on the page reads it, it belongs in an entity. If it lives for one interaction and only one element cares, leave it to the browser.

## Input

There are two ways, depending on whether the rest of the app needs the value while it is being typed.

**Through the store**, when validation, a live preview or a save button depends on the value. The [Form](../featured/form.md) type keeps `values`, `errors` and whether the form is pristine, and every keystroke is a `fieldChange` event:

```javascript
html`<input
  .value=${entity.values.email}
  @input=${(event) =>
    api.notify(`#${entity.id}:fieldChange`, {
      path: "email",
      value: event.target.value,
    })}
/>`
```

**Through the DOM**, when only the submitted result matters. The input keeps its own value while the user types, and the form hands it over once, on submit:

```javascript
html`<form
  @submit=${(event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.target))
    api.notify(`#${entity.id}:search`, values)
  }}
>
  <input name="query" />
</form>`
```

## Hover and focus

These are the browser's, and CSS reads them: `:hover`, `:focus-visible`, `:focus-within`. There is nothing to store.

To move focus, the `ref` directive hands you the element:

```javascript
import { ref } from "@inglorious/web/directives/ref"

html`<input ${ref((element) => element?.focus())} />`
```

If the app needs to know what is focused, for example to keep a list's keyboard selection, that selection is application state and lives in the entity, as `focusedIndex` does in Inglorious UI's Combobox.

## Animations

The entity says which state something is in: open or closed, present or leaving. The frames in between belong to the browser. [Inglorious Motion](https://inglorious.dev/motion/) runs transitions with CSS and the Web Animations API, from the variant and presence the entity holds, so nothing changes in the store 60 times a second.

## Gestures in progress

A drag or a pinch changes on every pointer move and means nothing once it ends. Keep it next to the element, outside the store, and send the store the result. Inglorious UI's image cropper does exactly that, holding its active pointers per element:

```javascript
const gestures = new WeakMap() // element -> pointers, drag in progress

html`<div
  @pointerdown=${(event) =>
    gestures.set(event.currentTarget, { startX: event.clientX })}
  @pointerup=${(event) => {
    const gesture = gestures.get(event.currentTarget)
    gestures.delete(event.currentTarget)
    api.notify(`#${entity.id}:moved`, event.clientX - gesture.startX)
  }}
></div>`
```

The store sees one event, `moved`, rather than every pixel on the way.
