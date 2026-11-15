# Inglorious Store

[![NPM version](https://img.shields.io/npm/v/@inglorious/store.svg)](https://www.npmjs.com/package/@inglorious/store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An entity-based state store, inspired by game engines and compatible with Redux's tooling. State is a map of plain entities, behavior lives in types, and everything that happens is an event.

**[Documentation](https://inglorious.dev/store/)**

## Install

```bash
pnpm add @inglorious/store
```

## In a few lines

```javascript
import { createStore } from "@inglorious/store"

const types = {
  TodoList: {
    todoAdd(entity, text) {
      entity.todos.push({ id: Date.now(), text, isDone: false })
    },
  },
}

const entities = {
  work: { type: "TodoList", todos: [] },
  personal: { type: "TodoList", todos: [] },
}

const store = createStore({ types, entities })

store.notify("todoAdd", "Buy milk") // every TodoList
store.notify("#work:todoAdd", "Finish report") // only `work`
```

- An **entity** is a plain object with an `id` and a `type`. A **type** is an object of event handlers, `handler(entity, payload, api)`, which mutate the entity they are given; [Mutative](https://github.com/unadlib/mutative) turns the mutation into a new immutable state.
- An **event** reaches every entity whose type handles it, or one type (`"TodoList:todoAdd"`), or one entity (`"#work:todoAdd"`). Handlers notify further events through `api.notify`, and the queue applies them in order, one transaction each.
- Entities have a lifecycle: `add` and `remove` run their `create` and `destroy`, where a type opens and closes what it needs from the outside world.

## What's in it

- [`handleRequest` and `handleAsync`](https://inglorious.dev/store/advanced/async-operations): the lifecycle of an async call as events, with status and error kept on the entity, outdated answers dropped, and `optimistic` updates.
- [`fsm` and `scenes`](https://inglorious.dev/store/advanced/state-machines): a type that answers events by state, and the entities that stand in each state.
- [`withStorage`](https://inglorious.dev/store/api/reference#withstorage-fields-options): fields kept in local storage as a byproduct of the entity.
- [Systems and middlewares](https://inglorious.dev/store/guide/core-concepts#composition): handlers that see every entity at once, and functions that wrap the store.
- [`compute`](https://inglorious.dev/store/api/reference#compute-fn-selectors): memoized derived state, with `createSelector` as its Redux-compatible alias.
- [Redux DevTools](https://inglorious.dev/web/advanced/devtools) and `react-redux`: the store has `subscribe`, `getState` and `dispatch`, so a React app can adopt it as its Redux store first and move its components to [Inglorious Web](https://inglorious.dev/web/) later. [`@inglorious/react-store`](https://www.npmjs.com/package/@inglorious/react-store) adds `useEntity` and `useNotify`.
- [Testing](https://inglorious.dev/store/advanced/testing): `trigger(entity, handler, payload)` runs a handler and returns the new entity and the events it notified, with no store.
- [TypeScript](https://inglorious.dev/store/api/reference#type-safety-typescript): typed entities, handlers, payloads and events, with no casts.

## Two rules

- **A handler writes to the entity it is given, before its first `await`.** The entity is a draft that lives until the update ends; after an `await`, notify an event that does the writing, or use `handleRequest`.
- **An event's handlers read the state as the previous event left it.** Whatever order they run in, they see the same world, and the next event sees what they changed.

## Where it goes

Standalone, in a React app through `react-redux` or `@inglorious/react-store`, under [Inglorious Web](https://inglorious.dev/web/) for the DOM, under [Inglorious Engine](https://inglorious.dev/engine/) for games, or on a server with [`@inglorious/server`](https://www.npmjs.com/package/@inglorious/server) for multiplayer.

## License

MIT © [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)
