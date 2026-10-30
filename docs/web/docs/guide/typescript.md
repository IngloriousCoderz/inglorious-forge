---
title: TypeScript
description: Typing entities, types and the api with the declarations every package ships
---

# TypeScript

Every `@inglorious` package ships its own type declarations, so there is nothing to install. To start a TypeScript project, pick the `ts` template of [create-app](./installation.md).

The approach: describe your entities, say which ones the app has, and let `satisfies` check each type against them. No casts.

## Entities

Each entity is an interface extending `BaseEntity`, with its `type` as a literal:

```typescript
import { type BaseEntity, type EntitiesState } from "@inglorious/store"
import { type RouterEntity } from "@inglorious/web/router"

interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

interface AppRouterEntity extends RouterEntity {
  type: "Router"
}

type AppEntity = CounterEntity | AppRouterEntity

interface AppState extends EntitiesState<AppEntity> {
  counter: CounterEntity
  router: AppRouterEntity
}
```

## Types

`Api<AppEntity, AppState>` is the `api` every handler and `render` receives. `satisfies EntityType<…>` checks a type's handlers against its entity while keeping their own inferred signatures:

```typescript
import { type EntityType } from "@inglorious/store"
import { type Api, html } from "@inglorious/web"

type AppApi = Api<AppEntity, AppState>

const Counter = {
  increment(entity) {
    entity.value++
  },
  render(entity, api) {
    const route = api.getEntity("router")?.route
    return html`<button @click=${() => api.notify(`#${entity.id}:increment`)}>
      ${entity.value} on ${route}
    </button>`
  },
} satisfies EntityType<CounterEntity, AppApi>
```

`entity.value++` is checked against `CounterEntity`, and `api.getEntity("router")` returns an `AppRouterEntity`, so a misspelled property is an error.

## The store

```typescript
import { createStore } from "@inglorious/store"
import { Router } from "@inglorious/web/router"

export const store = createStore<AppEntity, AppState>({
  types: { Counter, Router },
  entities: {
    counter: { type: "Counter", value: 0 },
    router: { type: "Router" },
  },
})
```

Featured types such as `Form`, `Router` and the sensors export their entity interfaces (`FormEntity`, `RouterEntity`, `MediaQueryEntity`…): extend them as above.

## Checking your types

The packages check their own declarations with type tests: small `.ts` files compiled with `tsc --noEmit` that must pass, plus `@ts-expect-error` lines that must fail. The same works for an app's own types: see `packages/web/type-tests/app.ts` in the [repository](https://github.com/IngloriousCoderz/inglorious-forge) for a complete example.
