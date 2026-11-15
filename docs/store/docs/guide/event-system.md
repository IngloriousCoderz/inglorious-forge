---
title: Event System
description: How events reach entities, how the queue applies them, and what a handler sees.
---

# Event System

Every change to the state is an event, notified by the app or by a handler, and applied by the store in order.

## Targeting

```javascript
store.notify("taskComplete", "task123") // every entity with the handler
store.notify("TodoList:taskComplete", "task123") // every TodoList
store.notify("#work:taskComplete", "task123") // only `work`
store.notify("TodoList#work:taskComplete", "task123") // `work`, as a TodoList
```

Broadcast when the event is news that several types may care about: `sessionChange`, `routeChange`, `taskComplete`. Target an entity when the event is an instruction to it: `#work:todoAdd`, `#router:navigate`. A type name or an entity id that nothing answers is a warning in the console, since it is usually a typo; a broadcast nobody handles is not.

## The queue

Events are queued and applied one at a time. In the default `auto` update mode every `notify` from outside the store starts an update, which drains the queue, including the events the handlers notify meanwhile, and then notifies subscribers once. In `manual` mode events wait until `store.update()`, which is how a game applies a frame's worth of input at once.

```javascript
const store = createStore({ types, entities, updateMode: "manual" })

store.notify("playerMove", { x: 100, y: 50 })
store.notify("enemySpot", { enemyId: "e1" })
store.update() // both applied, one render
```

An event notified by a subscriber, such as a render that registers a type lazily, is queued and applied after the subscribers have run.

## What handlers see

Each event is a transaction. The handlers of one event all read, through `api.getEntity()` and `api.getEntities()`, the state as the previous event left it: whatever order they run in, they see the same world, and they cannot see each other's writes. The next event in the queue sees what they changed.

```javascript
const types = {
  Session: {
    signIn(entity, user, api) {
      entity.user = user
      api.notify("#router:navigate", "/account")
    },
  },
  AccountPage: {
    routeChange(entity, payload, api) {
      if (payload.route !== entity.id) return
      // `signIn` ran in an earlier event: the user is there
      if (!api.getEntity("session").user)
        api.notify("#router:navigate", "/login")
    },
  },
}
```

Handlers of the same broadcast event, then, should not depend on each other's writes: if `Stats` needs the todo that `TodoList` just added, `TodoList` notifies it, and `Stats` handles that event next.

The entity a handler is given is a draft of the current update, and so is everything read from it. The draft is revoked when the update ends, so:

- write to the entity before the first `await`, and notify an event for what comes after; an `async` handler that touches its entity after one fails with an error that says so;
- pass a draft in a payload only to handlers of the same update, which is what a chain of events is; anything read later, after an `await` or in a timer, gets a copy: `{ ...entity.values }` for flat values, deeper for nested ones.

[`handleRequest`](../advanced/async-operations.md) keeps both rules for a request.

## Lifecycle events

- `add(entity)` puts the entity in the state and runs its `create`, which reaches only that entity. A type registered later, with `api.setType`, sends `create` to the entities already waiting for it.
- `remove(id)` runs the entity's `destroy`, then takes it out.
- `patch(entity)` merges the named fields into an existing entity; `replace(entity)` installs the whole entity. Neither runs `create` or `destroy`.
- `pause` stops `update` events, and `resume` starts them again; an entity with `updatesWhilePaused` keeps updating.
- `stateChange`, broadcast by [`fsm`](../advanced/state-machines.md), says that an entity moved to another state.

## Next

- [Async Operations](../advanced/async-operations.md): a request as events.
- [Systems](../advanced/systems.md): handlers that see every entity at once.
- [Testing](../advanced/testing.md): events a handler notifies, asserted.
