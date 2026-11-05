import {
  type Api,
  type BaseEntity,
  createStore,
  defineType,
  type EntitiesState,
  type EntityType,
  type TypeDefinition,
} from "../types"
import { fsm } from "../types/behaviors/state-machine/fsm"

interface ChatEntity extends BaseEntity {
  type: "Chat"
  messages: string[]
  draft: string
  state: "idle" | "busy"
}

/** Keeps nothing of its own: it draws what it reads from the chat. */
interface ScoreboardEntity extends BaseEntity {
  type: "Scoreboard"
}

type AppEntity = ChatEntity | ScoreboardEntity

interface AppState extends EntitiesState<AppEntity> {
  chat: ChatEntity
  scoreboard: ScoreboardEntity
}

type AppApi = Api<AppEntity, AppState>

/** What a template takes: not the entity, but what its caller chose to give it. */
interface ScoreProps {
  count: number
  label: string
  onReset: () => void
}

const template = {
  renderScore(props: ScoreProps) {
    return `${props.label}: ${props.count}`
  },
}

// Sub-renderers take props, which `EntityType` would refuse: it reads every
// member as a handler, whose first parameter is the entity.
export const Scoreboard = defineType<ScoreboardEntity, AppApi>()({
  ...template,
  render(entity, api) {
    const id: string = entity.id
    const messages = api.getEntity("chat")?.messages ?? []
    return this.renderScore({
      count: messages.length,
      label: id,
      onReset: () => api.notify("#chat:clear"),
    })
  },
  reset(entity, _payload, api) {
    api.notify(`#${entity.id}:resetDone`)
  },
})

// In a list of behaviors, an object with sub-renderers goes through
// `defineType`; the rest of the list is as usual.
const logs = (type: EntityType<ChatEntity, AppApi>) => ({
  ...type,
  log(entity: ChatEntity) {
    console.warn(entity.draft)
  },
})

export const Chat: TypeDefinition<ChatEntity, AppApi> = [
  {
    clear(entity) {
      entity.messages = []
    },
  },
  logs,
  fsm<ChatEntity, AppApi>({
    idle: {
      send(entity) {
        entity.state = "busy"
      },
    },
  }),
  defineType<ChatEntity, AppApi>()({
    renderLine(props: { line: string }) {
      return props.line
    },
    render(entity) {
      return entity.messages.map((line) => this.renderLine({ line })).join("")
    },
  }),
]

// The store takes both, as it takes any other type.
export const store = createStore<AppEntity, AppState>({
  types: { Chat, Scoreboard },
  entities: {
    chat: { type: "Chat", messages: [], draft: "", state: "idle" },
    scoreboard: { type: "Scoreboard" },
  },
})

// ---- must fail ----

defineType<ChatEntity, AppApi>()({
  send(entity) {
    // @ts-expect-error: a handler gets the entity, which has no `nope`
    entity.nope = 1
  },
})

defineType<ChatEntity, AppApi>()({
  // @ts-expect-error: `render` draws the entity, so it takes the entity, not props
  render(props: ScoreProps) {
    return props.label
  },
})

defineType<ChatEntity, AppApi>()({
  // @ts-expect-error: a member that is not a renderer is a handler, which takes the entity
  send(props: ScoreProps) {
    return props.count
  },
})

defineType<ChatEntity, AppApi>()({
  renderLine(props: { line: string }) {
    return props.line
  },
  render() {
    // @ts-expect-error: `this` is the behavior, which has no `renderNope`
    return this.renderNope({ line: "" })
  },
})

createStore<AppEntity, AppState>({
  types: {
    // @ts-expect-error: a behavior for the chat is not one for the scoreboard
    Scoreboard: defineType<ChatEntity, AppApi>()({
      clear(entity) {
        entity.messages = []
      },
    }),
  },
})
