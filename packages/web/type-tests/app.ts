import {
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
} from "@inglorious/store"

import { type Api, html, type TemplateResult } from "../types"
import { withLiveReload } from "../types/decorators/with-live-reload"
import { Form, type FormEntity } from "../types/form"
import { PwaUpdate, type PwaUpdateEntity, watchPwaUpdate } from "../types/pwa"
import {
  pageRouteChange,
  Router,
  type RouterEntity,
  safePath,
} from "../types/router"
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

declare const counterToReset: LoginEntity
Form.reset(counterToReset)
Form.fieldChange(counterToReset, { path: "email", value: "a@b.c" })
// @ts-expect-error: a change names its field
Form.fieldChange(counterToReset, { value: "a@b.c" })

const source = { subscribe: () => () => {} }
export const liveStore = createStore<AppEntity, AppState>({
  types: {
    Counter: [
      Counter,
      withLiveReload<CounterEntity>({
        source,
        tables: ["counters"],
        payload: (entity) => entity.value,
      }),
    ],
  },
})
withLiveReload<CounterEntity>({
  source,
  tables: ["counters"],
  // @ts-expect-error: the entity is typed
  payload: (entity) => entity.nope,
})
// @ts-expect-error: tables are required
withLiveReload({ source })

export const routeChange = pageRouteChange({
  select: (payload) => payload.params.eventId,
  open: (entity: { id: string; eventId?: string }, eventId) => {
    entity.eventId = eventId
  },
  close: (entity) => {
    entity.eventId = undefined
  },
})
pageRouteChange({
  // @ts-expect-error: a page entity has an id
  open: (entity: { name: string }) => entity,
})
pageRouteChange({
  // @ts-expect-error: select picks what open takes
  select: (payload) => payload.params.eventId,
  open: (entity: { id: string }, count: number) => count,
})
export const bare = pageRouteChange()

export const back: string | null = safePath("/events")
