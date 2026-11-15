---
title: Core Concepts
description: Entities, types, events, the api and composition in Inglorious Web
---

# Core Concepts

Inglorious Web adds one thing to [Inglorious Store](https://inglorious.dev/store/): a type can `render` its entity. Everything else is the store's.

## Entities and types

An entity is a plain object with an `id`, a `type` and its state. A type is an object of event handlers, with an optional `render`:

```javascript
import { html } from "@inglorious/web"

const User = {
  signIn(entity, { email }) {
    entity.isSignedIn = true
    entity.email = email
  },

  signOut(entity) {
    entity.isSignedIn = false
  },

  render(entity, api) {
    if (!entity.isSignedIn) return html`<button>Sign in</button>`
    return html`
      <div>Welcome, ${entity.name}</div>
      <button @click=${() => api.notify(`#${entity.id}:signOut`)}>
        Sign out
      </button>
    `
  },
}

const entities = {
  user: { type: "User", name: "Alice", isSignedIn: false },
}
```

A handler takes `(entity, payload, api)` and mutates the entity. `render` takes `(entity, api)` and returns a template. Nothing calls a handler directly: an event does. The type's name is the entity's `type`, case included.

## Events

```javascript
api.notify("refresh") // every entity with a refresh handler
api.notify("User:signOut") // every User
api.notify("#user:signIn", { email: "alice@example.com" }) // only `user`
```

Events are applied in order, each as a transaction: the handlers of one event read the state as the previous event left it, and the next event reads what they changed. The screen renders once the queue is empty. See the [event system](./event-system.md).

## The api

The same `api` reaches handlers and renders: `api.render(id)` renders another entity through its type, `api.getEntity`, `api.getEntities` and `api.select` read the state, `api.notify` queues an event.

```javascript
const Page = {
  render(entity, api) {
    const user = api.getEntity("user")
    return html`
      <header>${api.render("header")}</header>
      <h1>Welcome, ${user.name}</h1>
    `
  },
}
```

A render method is a plain function too, so a type can call another's with props: `Header.render({ title: "Hello" }, api)`.

## Mounting

```javascript
import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"

const store = createStore({ types: { User, Page, Header }, entities })

mount(store, (api) => api.render("page"), document.getElementById("root"))
```

`mount` renders, subscribes to the store, hydrates markup already in the element, notifies `init` once mounted and resolves to a function that unsubscribes.

## Composition

A type can be a list of behaviors, applied in order like a pipe: each is added to the type built so far, and a later handler of the same name replaces the earlier one. A behavior that is a function receives the type built so far and can wrap its handlers:

```javascript
const requireAuth = (type) => ({
  routeChange(entity, payload, api) {
    if (payload.route !== entity.id) return
    if (!api.getEntity("session").user) {
      api.notify("#router:navigate", { to: "/login", replace: true })
      return
    }
    type.routeChange?.(entity, payload, api)
  },
})

const types = {
  ProtectedPage: [Page, requireAuth],
}
```

Since each behavior wraps what came before it, **the last one is the outermost and runs first**. [Type Composition](../advanced/type-composition.md) has the patterns; the store's [core concepts](https://inglorious.dev/store/guide/core-concepts#composition) say when a behavior, a system or a middleware is the right tool.
