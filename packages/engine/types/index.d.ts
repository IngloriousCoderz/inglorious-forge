import type {
  Api,
  BaseEntity,
  EntitiesState,
  Stored,
  System,
} from "@inglorious/store"
import type { MultiplayerMiddlewareConfig } from "@inglorious/store/client/multiplayer-middleware.js"
import type { Vector3 } from "@inglorious/utils/vector.js"

import type { LoopType } from "./core/loops/index"

/** A collision shape's kind. */
export type Shape =
  "circle" | "line" | "point" | "rectangle" | "segment" | "hitmask"

/**
 * The point a box hangs from, as fractions of its size on each axis: `[0, 0]`
 * is its bottom-left corner, `[0.5, 0.5, 0.5]` its centre. A missing axis is
 * centred.
 */
export type Anchor = readonly [x: number, y: number, z?: number]

/** How an entity collides in one group, such as `hitbox` or `bounds`. */
export interface Collision {
  shape: Shape
  /** Defaults to the entity's size. */
  size?: Vector3
  /** Defaults to the entity's radius. */
  radius?: number
  /** Added to the entity's position. */
  offset?: Vector3
  /** Defaults to the entity's anchor. */
  anchor?: Anchor
  [key: string]: unknown
}

/** An entity in the world: what the engine's behaviors and renderers read. */
export interface Entity extends BaseEntity {
  position?: Vector3
  size?: Vector3
  radius?: number
  offset?: Vector3
  anchor?: Anchor
  /** In radians, counterclockwise from the x axis. */
  orientation?: number
  velocity?: Vector3
  acceleration?: Vector3
  /** Drawn over entities on lower layers. Defaults to 0. */
  layer?: number
  /** Collides as a rectangle of its size in every group it names no shape for. */
  solid?: boolean
  /** Its collision shapes, by group. */
  collisions?: Record<string, Collision>
}

/** The `game` entity: the world's size and the switches the engine reads. */
export interface GameEntity extends BaseEntity {
  /** The world's width and height. */
  size: Vector3 | readonly [width: number, height: number]
  backgroundColor?: string
  /** Connects the Redux DevTools; `D` toggles it. */
  devMode?: boolean
  /** Draws collision gizmos; `C` toggles it. */
  debug?: boolean
  paused?: boolean
  /** Stops the engine after the current frame. */
  quit?: boolean
  /** Draws images without smoothing. */
  pixelated?: boolean
  /** Shares events with a multiplayer server. */
  multiplayer?: MultiplayerMiddlewareConfig
}

/** The api the engine hands every handler: the store's, and the entity pools'. */
export interface GameApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> extends Api<TEntity, TState> {
  /** The pooled entities in play, from `spawn`. */
  getAllActivePoolEntities: () => Stored<Entity>[]
  /** The first entity that collides with `entity`, pooled ones included. */
  findCollision: (
    entity: Entity,
    entities?: Record<string, Entity>,
    collisionGroup?: string,
  ) => Stored<Entity> | undefined
  /** How many entities each pool holds, in `devMode`. */
  getEntityPoolsStats?: () => Record<
    string,
    { active: number; inactive: number }
  >
}

/** An event handler: the entity, the event's payload and the api. */
export type EventHandler<
  TEntity extends BaseEntity = Entity,
  TApi extends GameApi = GameApi,
> = (entity: Stored<TEntity>, payload: any, api: TApi) => unknown

/** Draws an entity on a 2D canvas, from its position. */
export type Render<
  TEntity extends BaseEntity = Entity,
  TApi extends GameApi = GameApi,
> = (entity: TEntity, ctx: CanvasRenderingContext2D, api: TApi) => void

/** A type for one kind of entity: its event handlers, by event name, and its `render`. */
export type GameType<
  TEntity extends BaseEntity = Entity,
  TApi extends GameApi = GameApi,
> = {
  render?: Render<TEntity, TApi>
  [handler: string]: EventHandler<TEntity, TApi> | undefined
}

/** A behavior: a type, or a function that extends the type it is given. */
export type GameBehavior<
  TEntity extends BaseEntity = Entity,
  TApi extends GameApi = GameApi,
> =
  | GameType<TEntity, TApi>
  | ((type: GameType<TEntity, TApi>) => GameType<TEntity, TApi>)

/** A behavior for any entity, whatever entity it is written for. */
export type AnyGameBehavior =
  GameType<never, never> | ((type: never) => GameType<never, never>)

/** What a game's `types` holds for one type name: a behavior, or several. */
export type GameTypeDefinition = AnyGameBehavior | AnyGameBehavior[]

/** An entity as a game's configuration lists it: its type, and anything else. */
export type EntityConfig = BaseEntity & { [key: string]: unknown }

/** A game, or a part of one such as a renderer: the engine merges them in order. */
export interface GameConfig {
  /** Which loop drives the game, and the rate the fixed one keeps. */
  loop?: { type?: LoopType; fps?: number }
  types?: Record<string, GameTypeDefinition>
  entities?: Record<string, BaseEntity | EntityConfig>
  systems?: (System | GameSystem)[]
}

/** Any type, whatever entity it is for: what a decorator is handed. */
export type AnyGameType = GameType<never, never>

/** A handler for entities like `TEntity`, with payloads like `TPayload`. */
export type Handler<TEntity extends BaseEntity, TPayload = void> = (
  entity: Stored<TEntity>,
  payload: TPayload,
  api: GameApi,
) => void

/** An `update` handler: the seconds since the last frame are its payload. */
export type UpdateHandler<TEntity extends BaseEntity> = Handler<TEntity, number>

/** A behavior that extends the type it is given with `THandlers`. */
export type Decorator<THandlers> = (type: AnyGameType) => THandlers

/** A system: its handlers receive every entity rather than one. */
export type GameSystem = {
  [event: string]: (entities: EntitiesState, payload: any, api: GameApi) => void
}

/** What the steering behaviors read from the entity they move. */
export interface Kinematic {
  position: Vector3
  velocity?: Vector3
  /** In radians. */
  orientation?: number
  maxSpeed?: number
  maxAcceleration?: number
  /** Radians a second. */
  maxAngularSpeed?: number
  maxAngularAcceleration?: number
  angularSpeed?: number
}

/** What a steering behavior moves towards or away from. */
export interface SteeringTarget {
  position: Vector3
  velocity?: Vector3
  orientation?: number
}

/** A steering behavior's result: the entity's new movement, or the entity itself when it has arrived. */
export type Steering<TEntity, TMovement> = TEntity | TMovement

export type KinematicMovement = {
  velocity: Vector3
  position: Vector3
  orientation: number
}

export type DynamicMovement = KinematicMovement & { acceleration?: Vector3 }
