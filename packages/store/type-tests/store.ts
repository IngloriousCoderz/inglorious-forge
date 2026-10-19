// Type-level tests: `tsc -p type-tests` fails on any error, and on any
// `@ts-expect-error` whose error does not happen.

import {
  type Api,
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
  type Middleware,
} from "../types"
import { trigger } from "../types/test"

interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

interface LabelEntity extends BaseEntity {
  type: "Label"
  text: string
}

type AppEntity = CounterEntity | LabelEntity

interface AppState extends EntitiesState<AppEntity> {
  counter: CounterEntity
  label: LabelEntity
}

type AppApi = Api<AppEntity, AppState>

// The recommended way: a type alias declares the type's events and payloads,
// and the type is checked against it
type LabelType = {
  rename: (entity: LabelEntity, text: string) => void
  render: (entity: LabelEntity, api: AppApi) => string
}

export const Label: LabelType = {
  rename(entity, text) {
    entity.text = text
  },
  render(entity, api) {
    return `${entity.text} ${api.getEntity("counter")?.value ?? 0}`
  },
}

declare const storedLabel: LabelEntity & { id: string }
Label.rename(storedLabel, "hello")
// @ts-expect-error: rename takes a string
Label.rename(storedLabel, 2)

export const misspelled: LabelType = {
  rename(entity, text) {
    entity.text = text
  },
  render: (entity) => entity.text,
  // @ts-expect-error: LabelType has no `renmae`
  renmae(entity: LabelEntity) {
    entity.text = ""
  },
}

// @ts-expect-error: render is missing
export const incomplete: LabelType = {
  rename(entity, text) {
    entity.text = text
  },
}

// An interface does not fit the store's `types`: declare types with `type`
interface LabelInterface {
  rename: (entity: LabelEntity, text: string) => void
}
declare const LabelFromInterface: LabelInterface
createStore<AppEntity, AppState>({
  // @ts-expect-error: an interface has no index signature
  types: { Label: LabelFromInterface },
})

// The shorthand: `satisfies` infers the handlers' parameters and keeps the
// type's members, but neither lists the events nor types unannotated payloads
const Counter = {
  increment(entity) {
    entity.value++
  },
  add(entity, amount: number) {
    entity.value += amount
  },
  copyLabel(entity, _payload, api) {
    entity.value = api.getEntity("label")?.text.length ?? 0
  },
} satisfies EntityType<CounterEntity, AppApi>

// Its handlers can be called directly, as tests and wrapping types do
declare const counter: CounterEntity & { id: string }
Counter.increment(counter)
Counter.add(counter, 2)
// @ts-expect-error: add takes a number
Counter.add(counter, "2")

// The store gives every entity its id, so handlers receive it
export const Labeled: EntityType<LabelEntity, AppApi> = {
  focus(entity, _payload, api) {
    const id: string = entity.id
    api.notify(`#${id}:focused`)
  },
}

// Behaviors: a function extending a type, and arrays of behaviors
const logs = (type: EntityType<LabelEntity, AppApi>) => ({
  ...type,
  log(entity: LabelEntity) {
    console.warn(entity.text)
  },
})

// `types` checks each type against its entity, with no cast
export const store = createStore<AppEntity, AppState>({
  types: {
    Counter,
    Label: [Label, logs],
    // A name no entity has takes any type
    App: { render: () => null },
  },
  entities: {
    counter: { type: "Counter", value: 0 },
    // A store flag every entity can set
    label: { type: "Label", text: "hi", updatesWhilePaused: true },
  },
})

// Without type arguments, the entity type comes from the entities
const middlewares: Middleware<AppEntity, AppState>[] = []
export const inferred = createStore({
  types: { Counter },
  entities: {} as AppState,
  middlewares,
})

// An app's Api is an Api: a component typed with the plain one accepts it
declare function renderComponent(props: { title: string }, api: Api): string
declare const api: AppApi
renderComponent({ title: "x" }, api)

// A known id gives that entity's own type, with its id
export const label: string | undefined = api.getEntity("label")?.text
export const labelId: string | undefined = api.getEntity("label")?.id

// ---- must fail ----

export const typo: EntityType<CounterEntity, AppApi> = {
  increment(entity) {
    // @ts-expect-error: CounterEntity has no `valeu`
    entity.valeu++
  },
}

// The api is typed in handlers and in render, where it comes second
export const apiTyped = {
  copy(entity, _payload, api) {
    // @ts-expect-error: LabelEntity has no `nope`
    entity.text = api.getEntity("label")?.nope
  },
  render(entity, api) {
    // @ts-expect-error: LabelEntity has no `nope`
    return `${entity.text} ${api.getEntity("label")?.nope}`
  },
} satisfies EntityType<LabelEntity, AppApi>

export const wrongField: EntityType<LabelEntity, AppApi> = {
  render(entity) {
    // @ts-expect-error: text is a string
    const length: number = entity.text
    return length
  },
}

createStore<AppEntity, AppState>({
  types: {
    // @ts-expect-error: a Label type for the Counter entity
    Counter: {
      rename(entity: LabelEntity) {
        entity.text = ""
      },
    },
  },
})

createStore<AppEntity, AppState>({
  // @ts-expect-error: an entity of an unknown type
  entities: { counter: { type: "Countr", value: 0 } },
})

// ---- testing ----

const { entity: after, events } = trigger(
  { id: "counter", type: "Counter", value: 1 } as CounterEntity,
  Counter.add,
  2,
)
export const afterValue: number = after.value
export const eventCount: number = events.length

// @ts-expect-error: add takes a number
trigger({ type: "Counter", value: 1 } as CounterEntity, Counter.add, "2")
