import {
  type Api,
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
} from "../types"
import {
  fsm,
  type StateChangePayload,
} from "../types/behaviors/state-machine/fsm"
import { scenes } from "../types/behaviors/state-machine/scenes"

interface DoorEntity extends BaseEntity {
  type: "Door"
  state: "closed" | "open" | "locked"
  knocks: number
}

interface GameEntity extends BaseEntity {
  type: "Game"
  state?: "title" | "play"
}

interface CatEntity extends BaseEntity {
  type: "Cat"
  treats: number
}

type AppEntity = DoorEntity | GameEntity | CatEntity

interface AppState extends EntitiesState<AppEntity> {
  door: DoorEntity
  game: GameEntity
  cat: CatEntity
}

type AppApi = Api<AppEntity, AppState>

const Door = {
  knock(entity) {
    entity.knocks++
  },
} satisfies EntityType<DoorEntity, AppApi>

export const store = createStore<AppEntity, AppState>({
  types: {
    Door: [
      Door,
      fsm({
        closed: {
          open(entity) {
            entity.state = "open"
          },
          lock(entity, _payload, api) {
            entity.state = "locked"
            api.notify(`#${entity.id}:locked`)
          },
        },
        open: {
          close(entity) {
            entity.state = "closed"
          },
        },
        locked: {
          knock(entity) {
            entity.knocks = 0
          },
        },
      }),
    ],
    Game: [
      scenes({
        title: () => [{ id: "menu", type: "Menu", items: 3 }],
        play: (entity) => [{ id: `${entity.id}-board`, type: "Board" }],
      }),
      fsm({
        title: {
          start(entity) {
            entity.state = "play"
          },
        },
      }),
    ],
    Cat: [
      fsm({
        default: {
          meow(entity) {
            entity.treats++
          },
        },
        sleeping: {},
      }),
    ],
  },
  entities: {
    door: { type: "Door", state: "closed", knocks: 0 },
    game: { type: "Game" },
    cat: { type: "Cat", treats: 0 },
  },
})

export const DoorMachine = fsm<DoorEntity, AppApi>({
  open: {
    close(entity) {
      entity.state = "closed"
    },
  },
})

export const Watcher = {
  stateChange(_entity, { entityId, from, to }: StateChangePayload) {
    console.warn(entityId, from, to)
  },
} satisfies EntityType<CatEntity, AppApi>

// ---- must fail ----

createStore<AppEntity, AppState>({
  types: {
    Door: [
      fsm({
        // @ts-expect-error: the store's DoorEntity is never ajar
        ajar: {},
      }),
    ],
  },
})

fsm<DoorEntity, AppApi>({
  // @ts-expect-error: a door is never ajar
  ajar: {},
})

fsm<DoorEntity, AppApi>({
  open: {
    close(entity) {
      // @ts-expect-error: a door is never ajar
      entity.state = "ajar"
    },
  },
})

fsm<DoorEntity, AppApi>({
  open: {
    close(_entity, _payload, api) {
      // @ts-expect-error: CatEntity has no `nope`
      api.getEntity("cat")?.nope
    },
  },
})

scenes<GameEntity>({
  // @ts-expect-error: a scene's entities need their id
  title: () => [{ type: "Menu" }],
})

scenes<GameEntity>({
  // @ts-expect-error: a game is never over
  over: () => [],
})
