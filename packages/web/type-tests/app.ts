import {
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
} from "@inglorious/store"

import { type Api, html, type TemplateResult } from "../types"
import { Form, type FormEntity } from "../types/form"
import { PwaUpdate, type PwaUpdateEntity, watchPwaUpdate } from "../types/pwa"
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
interface UpdateEntity extends PwaUpdateEntity {
  type: "Update"
}
interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

type AppEntity =
  AppRouterEntity | LoginEntity | WideEntity | UpdateEntity | CounterEntity

interface AppState extends EntitiesState<AppEntity> {
  router: AppRouterEntity
  login: LoginEntity
  wide: WideEntity
  update: UpdateEntity
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

export const store = createStore<AppEntity, AppState>({
  types: { Router, Login: Form, Wide: MediaQuery, Update: PwaUpdate, Counter },
  entities: {
    router: { type: "Router" },
    counter: { type: "Counter", value: 0 },
  },
})

declare const registration: ServiceWorkerRegistration
export const stopWatching: () => void = watchPwaUpdate(registration, store, {
  id: "update",
})
// @ts-expect-error: checkEveryMs is a number of milliseconds
watchPwaUpdate(registration, store, { checkEveryMs: "1h" })

declare const api: AppApi
export const rendered = api.render("counter")
export const path: string | undefined = api.getEntity("router")?.path

export const typo: EntityType<CounterEntity, AppApi> = {
  render(entity, api) {
    // @ts-expect-error: CounterEntity has no `valeu`
    return api.render(entity.valeu)
  },
}
