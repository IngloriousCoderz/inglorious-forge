import type { Api } from "../../api"
import type { BaseEntity, EntityType, EventHandler } from "../../store"

/** The state an entity is in until a handler moves it. */
export type DefaultState = "default"

/**
 * The states an entity can be in: the values of its `state` field, as declared
 * on its interface. An entity that declares no `state` can be in any.
 */
export type StateOf<TEntity extends BaseEntity> = TEntity extends {
  state?: infer TState extends string
}
  ? TState
  : string

/**
 * What one state answers to: its handlers, by event name. A handler moves the
 * entity by assigning `entity.state`.
 */
export type FsmState<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = {
  [eventName: string]: EventHandler<TEntity, TApi> | undefined
}

/**
 * Each state's handlers, by state name. A state that answers nothing of its
 * own can be left out, and then it answers what the type does.
 */
export type FsmStates<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = {
  [TState in StateOf<TEntity> | DefaultState]?: FsmState<TEntity, TApi>
}

/**
 * The payload of `stateChange`, which `fsm` broadcasts whenever a handler has
 * moved the entity: the entity's id, the state it left and the one it is in.
 */
export interface StateChangePayload<TState extends string = string> {
  entityId: string
  from: TState
  to: TState
}

/**
 * Makes a type a finite state machine, in the manner of the OOP State pattern:
 * what the entity does on an event depends on the state it is in.
 *
 * Each state names the events it answers. A state's handler replaces the
 * type's handler for the same event, so the type's handler is what every state
 * does by default and a state takes it over by naming the event. A handler
 * moves the entity by assigning `entity.state`; the entity starts in its own
 * `state`, or in `"default"` when it has none.
 *
 * After a handler has moved the entity, the machine broadcasts `stateChange`
 * with a `StateChangePayload`. A handler that leaves the state as it was
 * announces nothing.
 *
 * The entity and the api are inferred from where the behavior is used, such as
 * `types: { Door: [Door, fsm({ ... })] }` in a typed store. Declaring `state`
 * on the entity's interface checks the state names as well.
 *
 * @example
 * ```typescript
 * interface DoorEntity extends BaseEntity {
 *   type: "Door"
 *   state: "closed" | "open" | "locked"
 * }
 *
 * const types = {
 *   Door: [
 *     { knock: (entity) => console.log("Nobody's home") },
 *     fsm({
 *       closed: {
 *         open(entity) {
 *           entity.state = "open"
 *         },
 *         lock(entity) {
 *           entity.state = "locked"
 *         },
 *       },
 *       open: {
 *         close(entity) {
 *           entity.state = "closed"
 *         },
 *       },
 *       locked: {
 *         unlock(entity) {
 *           entity.state = "closed"
 *         },
 *       },
 *     }),
 *   ],
 * }
 * ```
 *
 * @param states - Each state's handlers, by state name
 * @returns A behavior that wraps the type it is applied to
 */
export function fsm<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
>(
  states: FsmStates<TEntity, TApi>,
): (type: EntityType<TEntity, TApi>) => EntityType<TEntity, TApi>
