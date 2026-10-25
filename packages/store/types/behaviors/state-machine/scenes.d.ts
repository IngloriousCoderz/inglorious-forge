import type { Api } from "../../api"
import type { StateOf } from "./fsm"
import type { BaseEntity, EntityType, Stored } from "../../store"

/**
 * An entity a scene puts up. It needs its `id`, which is how two scenes tell
 * what they have in common.
 */
export type SceneEntity = BaseEntity & {
  id: string
  [field: string]: unknown
}

/**
 * What stands in each state, by state name: a function of the entity running
 * the machine that returns the entities to have standing. A state left out has
 * nothing standing.
 */
export type ScenesByState<TEntity extends BaseEntity = BaseEntity> = {
  [TState in StateOf<TEntity>]?: (entity: Stored<TEntity>) => SceneEntity[]
}

/**
 * Puts a state's entities up and takes down whatever the state before it had
 * up. It is usually paired with `fsm`, which says when the state moves: on
 * `create` it builds the entity's current state, and on its own `stateChange`
 * it builds the state it moved to.
 *
 * Only the difference between two states is touched: an entity that is in
 * both is left standing, and is patched rather than rebuilt when the next
 * state configures it differently. Entities are compared by `id`, and the
 * entity running the machine keeps what it has up in `scene`.
 *
 * @example
 * ```typescript
 * const types = {
 *   Game: [
 *     scenes({
 *       title: () => [{ id: "menu", type: "Menu" }],
 *       play: () => [{ id: "board", type: "Board" }],
 *     }),
 *     fsm({ title: { start(entity) { entity.state = "play" } } }),
 *   ],
 * }
 * ```
 *
 * @param scenesByState - What stands in each state
 * @returns A behavior handling `create` and `stateChange`
 */
export function scenes<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
>(scenesByState: ScenesByState<TEntity>): EntityType<TEntity, TApi>
