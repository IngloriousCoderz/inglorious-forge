---
title: Event System
description: Notifying events from templates and handlers, targeting, and the queue
---

# The Event System

Everything that changes state is an event. A template notifies one from a DOM event; a handler notifies one to tell the rest of the app what happened.

## From a template

```javascript
html`<input
  .value=${entity.name}
  @input=${(event) => api.notify(`#${entity.id}:nameChange`, event.target.value)}
/>`
```

A template addresses its own entity by id, so several instances of a type do not answer each other's events. The payload is the least the handler needs, as plain data: a `FormData` or an element would not survive the DevTools, a server or a test.

## Targeting

| Event                  | Reaches                            |
| ---------------------- | ---------------------------------- |
| `"refresh"`            | every entity whose type handles it |
| `"Todo:toggle"`        | every entity of type `Todo`        |
| `"#counter:increment"` | the entity `counter`               |
| `"Todo#todo1:toggle"`  | `todo1`, if it is a `Todo`         |

Type names are case-sensitive: `"todo:toggle"` reaches no `Todo`, and the store warns about it. Broadcast news, named after the subject (`cartChange`, `sessionChange`); address instructions to one entity (`#router:navigate`).

## The queue

Events are applied in order, one transaction each. The handlers of one event read, through `api.getEntity()`, the state as the previous event left it, and the next event reads what they changed. Subscribers hear once the queue is empty, so a chain of events renders once.

```javascript
const Session = {
  signIn(entity, user, api) {
    entity.user = user
    api.notify("#router:navigate", "/account")
  },
}

const AccountPage = {
  routeChange(entity, payload, api) {
    if (payload.route !== entity.id) return
    // `signIn` was an earlier event: its user is there
    entity.name = api.getEntity("session").user.name
  },
}
```

Two rules follow from the entity being a draft that lives until the update ends:

- write to it before the first `await`, and notify an event for what comes after (an `async` handler that touches it later fails with an error that says so); [`handleRequest`](https://inglorious.dev/store/advanced/async-operations) does that for a request;
- a draft in a payload is fine within the same update; anything read later, after an `await` or in a timer, gets a copy.

## Lifecycle

`create` runs when an entity is added, `destroy` when it is removed. A type opens what it needs in one and closes it in the other, keeping the handle outside the entity:

```javascript
const timers = new Map()

const Clock = {
  create(entity, _, api) {
    const { id } = entity
    timers.set(
      id,
      setInterval(() => api.notify(`#${id}:tick`), 1000),
    )
  },

  destroy(entity) {
    clearInterval(timers.get(entity.id))
    timers.delete(entity.id)
  },

  tick(entity) {
    entity.now = Date.now()
  },
}
```

`mount` notifies `init` once the app is mounted, which the router and forms use to attach their document listeners.
