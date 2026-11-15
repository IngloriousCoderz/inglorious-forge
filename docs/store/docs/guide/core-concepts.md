---
title: Core Concepts
description: Entities, types, events, the api, lifecycle and composition in Inglorious Store.
---

# Core Concepts

## Entities and types

State is a map of **entities**, plain objects with an `id` and a `type`. A **type** holds the behavior of every entity that names it: an object of event handlers.

```javascript
const types = {
  TodoList: {
    todoAdd(entity, text) {
      entity.todos.push({ id: Date.now(), text, isDone: false })
    },
    todoToggle(entity, id) {
      const todo = entity.todos.find((todo) => todo.id === id)
      if (todo) todo.isDone = !todo.isDone
    },
  },
}

const entities = {
  work: { type: "TodoList", todos: [] },
  personal: { type: "TodoList", todos: [] },
}
```

The type's name is the string the entity's `type` holds, case included: an entity of type `"todoList"` has no handlers when the type is declared as `TodoList`. The store warns about a type that looks like a misspelling of a declared one.

Another instance is another entity, at creation or later:

```javascript
store.notify("add", { id: "project", type: "TodoList", todos: [] })
```

## Handlers

A handler receives the entity, the event's payload and the `api`:

```javascript
const TodoList = {
  refresh(entity) {
    entity.refreshedAt = Date.now()
  },

  todoAdd(entity, text) {
    entity.todos.push({ id: Date.now(), text, isDone: false })
  },

  todoAddAndCount(entity, text, api) {
    entity.todos.push({ id: Date.now(), text, isDone: false })
    api.notify("#stats:todoCount", entity.todos.length)
  },
}
```

A handler mutates the entity it is given. [Mutative](https://github.com/unadlib/mutative) records the mutation into a new state, so the previous state stays as it was: time travel, selectors that compare by reference and the DevTools all work.

The `api` is how a handler reaches the rest of the world:

- `api.getEntity(id)` and `api.getEntities(typeName?)` read other entities, as the previous event left them. See [what handlers see](./event-system.md#what-handlers-see).
- `api.select(selector)` runs a selector against the state.
- `api.notify(type, payload)` queues another event. `api.dispatch({ type, payload })` is the Redux spelling of the same.
- `api.getType`, `api.getTypes` and `api.setType` read and replace types at runtime, as a lazily loaded page does.

Handlers are not pure: one can call `fetch`, subscribe to a browser API or write to storage. They are deterministic, because every change to the state goes through an event, and the queue applies events in order. A handler can be `async`, but the entity it was given is a draft that lives only until the update ends: write to it before the first `await`, and notify an event for what comes after. [`handleRequest`](../advanced/async-operations.md) does that for a request.

## Events

An event reaches every entity whose type handles it, or fewer:

```javascript
store.notify("todoAdd", "Buy milk") // every entity with a todoAdd handler
store.notify("TodoList:todoAdd", "Buy milk") // every TodoList
store.notify("#work:todoAdd", "Buy milk") // only `work`
store.notify("TodoList#work:todoAdd", "Buy milk") // `work`, if it is a TodoList
```

A targeted event that nothing answers, such as `#work:todoAd`, is a warning in the console; a broadcast that nobody handles is not, since broadcasting is how a type learns of things it may not care about.

Name a handler after what happened, with the subject first when the event is broadcast: `todoAdd`, `sessionChange`, `playerShoot`. An event addressed to one entity stays bare: `#loginForm:submit`.

## Lifecycle

`add` puts an entity into the state and runs its `create`; `remove` runs its `destroy` and takes it out. Both reach only that entity.

```javascript
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

`create` is where a type opens what it needs from the outside world, and `destroy` where it closes it. The handles themselves, a timer, a listener, a socket, are not state: they stay in the module or in a factory's closure, keyed by the entity's id, and the entity holds only what can be serialized. The entities that stand in each state of an app, a page's form, a wizard's step, come and go with [`scenes`](../advanced/state-machines.md#scenes).

`patch` and `replace` change an entity that is already there, without `create` or `destroy`: `patch` merges the fields it names, `replace` installs the whole entity. A field set to `undefined` is cleared, and a different `type` moves the entity onto that type's handlers.

## Composition

A type can be a list of behaviors, applied in order like a pipe: each one is added to the type built so far, and a later handler of the same name replaces the earlier one.

```javascript
const Counter = {
  increment(entity) {
    entity.value++
  },
}

const withLogging = (type) => ({
  increment(entity, payload, api) {
    console.log(`incrementing ${entity.id}`)
    type.increment?.(entity, payload, api)
  },
})

const types = {
  Counter: [Counter, withLogging],
}
```

A behavior is an object of handlers, or a function of the type built so far that returns handlers: a decorator. `withLogging` receives `Counter` and wraps its `increment`, calling it with every argument. Since each behavior wraps what came before it, **the last behavior is the outermost**: it runs first and decides whether the earlier ones run. `fsm`, `withStorage` and `withDebounce` go last for that reason.

Three mechanisms cut across types, each for one job:

- **A behavior** wraps one type: guards, logging, storage, state machines.
- **A system** receives every entity at once, after the entities' own handlers for the same event: `systems: [{ tick(entities, dt, api) {...} }]`. It is for logic that needs all entities together, such as the engine's clock or collision detection, and a system that only reads should go through `api.getEntities()`.
- **A middleware** takes the store and returns it, changed or wrapped: `(store) => store`. It is for what sits around the store rather than inside it, such as the DevTools wrapping `dispatch`, multiplayer sending events to a server, or view transitions wrapping `subscribe`. The first middleware wraps all the others.

## Next

- [Event System](./event-system.md): targeting, the queue, and what handlers see.
- [Async Operations](../advanced/async-operations.md): `handleRequest`, `handleAsync` and `optimistic`.
- [Testing](../advanced/testing.md): `trigger` and `createMockApi`.
