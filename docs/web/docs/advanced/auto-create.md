---
title: Auto Create Entities
description: One entity per type, created by the store
---

# Auto Create Entities

In a web app most entities are singletons: a header, a router, a settings page. With `autoCreateEntities`, the store creates one entity for each type that has none, with the type's name in camel case as its id. `create` gives it its initial state.

```javascript
const types = {
  Header: {
    create(entity) {
      entity.title = "My App"
    },
    render(entity) {
      return html`<header><h1>${entity.title}</h1></header>`
    },
  },
}

const store = createStore({ types, autoCreateEntities: true })

store.getEntity("header") // { id: "header", type: "Header", title: "My App" }
```

A type registered later with `api.setType`, as a lazily loaded page is, gets its entity then.

## Mixing

Entities declared in `entities` are kept as they are, and the store adds the missing singletons. A type with an entity declared, whatever its id, gets no second one.

```javascript
const store = createStore({
  types: { Header, TodoItem },
  entities: {
    todo1: { type: "TodoItem", title: "Buy milk" },
    todo2: { type: "TodoItem", title: "Walk the dog" },
  },
  autoCreateEntities: true,
})
```

## When to use it

Apps whose entities are mostly singletons, such as those `create-app` scaffolds. A game, where most types have many instances, declares its entities.
