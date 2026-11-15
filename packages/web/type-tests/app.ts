import {
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
  type EventsOf,
} from "@inglorious/store"

import { type Api, html, mount, type TemplateResult } from "../types"
import { withLiveReload } from "../types/decorators/with-live-reload"
import { Form, type FormEntity } from "../types/form"
import {
  createNativeUpdate,
  type NativeUpdatePlugin,
} from "../types/native/update"
import { type AppLinksPlugin, createAppLinks } from "../types/native/app-links"
import {
  type BackButtonPlugin,
  createBackButton,
} from "../types/native/back-button"
import { createPwaUpdate, type PwaUpdateEntity } from "../types/pwa"
import {
  pageRouteChange,
  Router,
  type RouterEntity,
  safePath,
} from "../types/router"
import { MediaQuery, type MediaQueryEntity } from "../types/device/media-query"

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
  types: {
    Router,
    Login: Form,
    Wide: MediaQuery,
    Update: createPwaUpdate({ checkEveryMs: 1000 }),
    Counter,
  },
  entities: {
    router: { type: "Router" },
    counter: { type: "Counter", value: 0 },
  },
})

// @ts-expect-error: checkEveryMs is a number of milliseconds
createPwaUpdate({ checkEveryMs: "1h" })

declare const nativeApp: NativeUpdatePlugin
export const NativeUpdate = createNativeUpdate({
  adapter: { requirement: async () => ({ minBuild: 4, storeUrl: null }) },
  plugin: nativeApp,
})
const textBuild = { requirement: async () => ({ minBuild: "4" }) }
// @ts-expect-error: minBuild is a build number
createNativeUpdate({ adapter: textBuild })

declare const linksApp: AppLinksPlugin
export const AppLinks = createAppLinks({ plugin: linksApp, router: "router" })
// @ts-expect-error: the router is an entity id
createAppLinks({ plugin: linksApp, router: 1 })

declare const backApp: BackButtonPlugin
export const BackButton = createBackButton({ plugin: backApp })
declare const backButton: {
  id: string
  type: "BackButton"
  rootPaths: string[]
}
BackButton.backButtonPress(backButton, { canGoBack: true })
// @ts-expect-error: the event says whether there is history to go back to
BackButton.backButtonPress(backButton, {})

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

// ---- typed events ----

type TypedCounterType = {
  increment: (entity: CounterEntity) => void
  add: (entity: CounterEntity, amount: number) => void
}

type TypedEvents = EventsOf<TypedCounterType>

export const typedStore = createStore<AppEntity, AppState, TypedEvents>({
  entities: { counter: { type: "Counter", value: 0 } },
})

// The root render gets the store's events: its notify checks them.
mount(
  typedStore,
  (api) => {
    api.notify("#counter:add", 1)
    // @ts-expect-error: no type answers `ad`
    api.notify("#counter:ad", 1)
    return html`${api.render("counter")}`
  },
  document.body,
)

// A typed api still renders components that take any app's api.
declare function renderAny(api: Api): TemplateResult
declare const typedApi: Api<AppEntity, AppState, TypedEvents>
renderAny(typedApi)

// Local notifications and geolocation are types of their own.
import { createLocalNotifications } from "../types/device/local-notifications"
import { createGeolocation } from "../types/device/geolocation"

export const reminders = createLocalNotifications()
reminders.localNotificationSchedule(
  { type: "Reminders", permission: "granted" },
  { id: 1, title: "Soon", at: new Date() },
)
// @ts-expect-error: an id is a whole number
reminders.localNotificationCancel({ type: "Reminders", permission: null }, "1")

export const geolocation = createGeolocation()

import { createBiometrics } from "../types/device/biometrics"

export const biometrics = createBiometrics()
