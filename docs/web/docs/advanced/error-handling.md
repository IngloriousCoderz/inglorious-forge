---
title: Error Handling
description: Errors as entity state, and the two render boundaries
---

# Error Handling

An error is state: a handler puts it on the entity, and the render shows it. Two boundaries keep a throwing render from taking the app down.

## In handlers and requests

```javascript
const User = {
  emailChange(entity, email) {
    entity.emailError = email.includes("@") ? null : "Invalid email"
    if (!entity.emailError) entity.email = email
  },
}
```

[`handleRequest`](https://inglorious.dev/store/advanced/async-operations) sets `status` to `"error"` and `error` to what went wrong, as the error's message or as `toError` makes of it, such as a translation key. Nothing touches the entity after an `await`: the error reaches it as an event.

```javascript
const Profile = {
  ...handleRequest(
    "load",
    {
      run: (id) => fetchProfile(id),
      success(entity, profile) {
        entity.profile = profile
      },
    },
    {
      toError: (error) =>
        isNetworkError(error) ? "errors.offline" : "errors.unknown",
    },
  ),

  render(entity, api) {
    if (entity.status === "error") {
      return html`
        <p class="error">${t(entity.error)}</p>
        <button
          @click=${() => api.notify(`#${entity.id}:load`, entity.profileId)}
        >
          Retry
        </button>
      `
    }
    return html`...`
  },
}
```

## Render boundaries

[`withErrorBoundary`](./decorators.md#witherrorboundary) wraps one type's render, so that entity shows a fallback while the rest of the app renders:

```javascript
import { withErrorBoundary } from "@inglorious/web/decorators/with-error-boundary"

const types = {
  Chart: [
    ChartBase,
    withErrorBoundary(
      (error, entity) => html`<p>${entity.title} failed: ${error.message}</p>`,
    ),
  ],
}
```

The root render function can throw too, before any entity is reached. `mount` takes `onError` and `fallback` for that, and keeps the subscription alive so one bad update cannot freeze the app:

```javascript
mount(store, renderApp, document.getElementById("root"), {
  onError: (error) => report(error),
  fallback: () => html`<main><h1>Something went wrong</h1></main>`,
})
```

Both catch what a render throws synchronously. What a handler throws is the handler's to catch, and put on the entity.

## A toast

An error any handler can raise is an entity any handler can notify, such as Inglorious UI's `Toast`: `api.notify("#toast:show", { message: "Could not save" })`. To hide it later, a handler sets a timer that notifies `#toast:hide`: the timer fires after the update, when the handler's draft is gone, so an event is what reaches the store.
