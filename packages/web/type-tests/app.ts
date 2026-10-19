// Type-level tests: `tsc -p type-tests` fails on any error, and on any
// `@ts-expect-error` whose error does not happen.

import {
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
} from "@inglorious/store"

import { type Api, html, type TemplateResult } from "../types"
import { Form, type FormEntity } from "../types/form"
import { Router, type RouterEntity } from "../types/router"
import { MediaQuery, type MediaQueryEntity } from "../types/sensors/media-query"

interface AppRouterEntity extends RouterEntity {
  type: "Router"
}
interface LoginEntity extends FormEntity<{ email: string }> {
  type: "Login"
}
interface WideEntity extends MediaQueryEntity {
  type: "Wide"
}
interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

type AppEntity = AppRouterEntity | LoginEntity | WideEntity | CounterEntity

interface AppState extends EntitiesState<AppEntity> {
  router: AppRouterEntity
  login: LoginEntity
  wide: WideEntity
  counter: CounterEntity
}

type AppApi = Api<AppEntity, AppState>

const Counter = {
  increment(entity) {
    entity.value++
  },
  render(entity, api) {
    const route = api.getEntity("router")?.route
    // @ts-expect-error: the api is typed in render too
    api.getEntity("router")?.nope
    return html`<button @click=${() => api.notify(`#${entity.id}:increment`)}>
      ${entity.value} ${route}
    </button>`
  },
} satisfies EntityType<CounterEntity, AppApi>

// A type declared with a type alias, as generated apps do
type GreetingType = {
  shout: (entity: CounterEntity, times: number) => void
  render: (entity: CounterEntity, api: AppApi) => TemplateResult
}

const Greeting: GreetingType = {
  shout(entity, times) {
    entity.value += times
  },
  render(entity, api) {
    return html`<p @click=${() => api.notify(`#${entity.id}:shout`, 2)}>
      ${api.render("counter")}
    </p>`
  },
}

declare const counterEntity: CounterEntity
// @ts-expect-error: shout takes a number
Greeting.shout(counterEntity, "2")
export const greetingTypes = createStore<AppEntity, AppState>({
  types: { Counter: Greeting },
})

// Library types register under the app's names, with no cast
export const store = createStore<AppEntity, AppState>({
  types: { Router, Login: Form, Wide: MediaQuery, Counter },
  entities: {
    router: { type: "Router" },
    counter: { type: "Counter", value: 0 },
  },
})

// The api handlers receive renders: there is a single Api
declare const api: AppApi
export const rendered = api.render("counter")
export const path: string | undefined = api.getEntity("router")?.path

export const typo: EntityType<CounterEntity, AppApi> = {
  render(entity, api) {
    // @ts-expect-error: CounterEntity has no `valeu`
    return api.render(entity.valeu)
  },
}
