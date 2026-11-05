import {
  type Api,
  type AsyncEvents,
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EventsOf,
  handleAsync,
} from "../types"
import { fsm } from "../types/behaviors/state-machine/fsm"

interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
  state?: "idle" | "counting"
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

// The types declare their events, and the api is told them: the handlers take
// the api they are declared in, which TypeScript resolves.
type CounterType = {
  add: (entity: CounterEntity, amount: number, api: AppApi) => void
  reset: (entity: CounterEntity) => void
  nudge: (entity: CounterEntity, by?: number) => void
  render: (entity: CounterEntity, api: AppApi) => string
} & AsyncEvents<"load", CounterEntity, string, number, AppApi>

type LabelType = {
  rename: (entity: LabelEntity, text: string) => void
  reset: (entity: LabelEntity) => void
  renderText: (props: { text: string }) => string
}

/** A library type that also takes any handler, through an index signature. */
type PromptType = {
  promptOpen: (entity: LabelEntity) => void
  promptAnswer: (entity: LabelEntity, answer: string) => void
  [handler: string]: unknown
}

type AppEvents = EventsOf<CounterType | LabelType | PromptType>

type AppApi = Api<AppEntity, AppState, AppEvents>

export const Counter: CounterType = {
  add(entity, amount, api) {
    entity.value += amount
    api.notify(`#${entity.id}:reset`)
    api.notify("Label:rename", String(entity.value))
  },
  reset(entity) {
    entity.value = 0
  },
  nudge(entity, by = 1) {
    entity.value += by
  },
  render(entity) {
    return String(entity.value)
  },
  ...handleAsync("load", {
    async run(url: string) {
      return url.length
    },
    success(entity: CounterEntity, value: number) {
      entity.value = value
    },
  }),
}

declare const api: AppApi
const id = "counter" as string

// Every way of sending an event names it after its target, if any.
api.notify("add", 1)
api.notify("Counter:add", 1)
api.notify("#counter:add", 1)
api.notify(`#${id}:add`, 2)
api.notify("Counter#counter:add", 3)
api.notify("reset")
api.notify("nudge")
api.notify("nudge", 2)
api.notify("load", "/count")

// The store's own events are always there.
api.notify("add", { id: "counter2", type: "Counter", value: 0 })
api.notify("remove", "counter2")
api.notify("patch", { id: "counter", value: 1 })
api.notify("pause")
api.notify("resume")

export const store = createStore<AppEntity, AppState, AppEvents>({
  types: { Counter },
  entities: { counter: { type: "Counter", value: 0 } },
})
store.notify("#counter:add", 1)

// A typed api is still an api, for components that take any app's api.
declare function takesAnyApi(api: Api): void
takesAnyApi(api)

// And fsm() takes it as before.
export const CountingCounter = fsm<CounterEntity, AppApi>({
  idle: {
    add(entity, amount: number, api) {
      entity.state = "counting"
      api.notify(`#${entity.id}:reset`)
    },
  },
})

// An api that has not been told its events takes any.
declare const plain: Api<AppEntity, AppState>
plain.notify("anything", { at: "all" })

// A type with an index signature keeps its named events.
api.notify("promptOpen")
api.notify("#label:promptAnswer", "yes")

// ---- must fail ----

// @ts-expect-error: no type answers `ad`
api.notify("#counter:ad", 1)

// @ts-expect-error: `add` takes a number
api.notify("#counter:add", "1")

// @ts-expect-error: `add` takes a payload
api.notify("#counter:add")

// @ts-expect-error: `reset` takes none
api.notify("reset", 1)

// @ts-expect-error: a renderer is not an event
api.notify("renderText", { text: "" })

// @ts-expect-error: the store checks its events too
store.notify("#counter:ad", 1)

// @ts-expect-error: `promptAnswer` takes a string
api.notify("#label:promptAnswer", 1)
