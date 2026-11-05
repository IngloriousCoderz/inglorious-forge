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

## Events

Each type's events are its handlers, so their declarations can tell the api which events exist and what they carry. List them with `type` aliases, read them with `EventsOf`, and give them to the api:

```typescript
import { type EventsOf } from "@inglorious/store"
import { type RouterType } from "@inglorious/web/router"

type CounterType = {
  increment: (entity: CounterEntity) => void
  add: (entity: CounterEntity, amount: number) => void
  render: (entity: CounterEntity, api: AppApi) => TemplateResult
}

type AppEvents = EventsOf<CounterType | RouterType>
type AppApi = Api<AppEntity, AppState, AppEvents>
```

Now ``api.notify(`#${entity.id}:incremnet`)`` is an error, and so is `api.notify("#counter:add", "2")`. Renderers are not events, and the store's own (`add`, `remove`, `pause`…) are always allowed. Pass `AppEvents` to `createStore<AppEntity, AppState, AppEvents>` as well: `mount` then gives the root render the same checks.

## Templates with props

Every render method takes props first: `render(props, api)`, where a type's props are its entity, and sub-renderers `renderX(props, ownProps, api)`, which get the component's props, then the item they draw. `EntityType` reads every member as an event handler, which takes the entity, so it rejects sub-renderers whose props are not the entity; `defineType` checks each member by its name instead:

```typescript
import { defineType } from "@inglorious/store"

export const Scoreboard = defineType<ScoreboardEntity, AppApi>()({
  ...template, // renderScoreboard(props, api), renderContender(props, speaker, api), ...
  render(props, api) {
    const memory = api.getEntity("debate")?.memory
    return this.renderScoreboard({ ...props, memory }, api)
  },
})
```

`render` still takes the entity as its props, sub-renderers keep the types they declare, every other member is a handler with its entity inferred, and `this` is the component itself.

## Checking your types

The packages check their own declarations with type tests: small `.ts` files compiled with `tsc --noEmit` that must pass, plus `@ts-expect-error` lines that must fail. The same works for an app's own types: see `packages/web/type-tests/app.ts` in the [repository](https://github.com/IngloriousCoderz/inglorious-forge) for a complete example.
