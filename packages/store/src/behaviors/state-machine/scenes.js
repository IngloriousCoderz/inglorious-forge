import { isDeepEqual } from "@inglorious/utils/object.js"

/**
 * The entities that stand in each state of a machine, usually paired with
 * `fsm`. On `create` and on its own `stateChange`, it adds the entities only
 * the new state has, removes those only the old one had, and patches those both
 * have but configure differently, compared by `id`, so what two states share
 * survives the move untouched. The current list is kept in `scene`.
 *
 * @example
 * ```js
 * const types = {
 *   Game: [scenes(SCENES), fsm({ title: { start(e) { e.state = "play" } } })],
 * }
 * ```
 *
 * @param {Object<string, (entity: object) => object[]>} scenesByState - The
 *   entities to have standing in each state, given the entity running the machine.
 * @returns {object} The behavior.
 */
export function scenes(scenesByState) {
  function build(entity, state, api) {
    const leaving = entity.scene ?? []
    const arriving = scenesByState[state]?.(entity) ?? []

    const leavingIds = leaving.map(({ id }) => id)
    const arrivingIds = arriving.map(({ id }) => id)

    for (const { id } of leaving) {
      if (arrivingIds.includes(id)) continue

      api.notify("remove", id)
    }

    for (const added of arriving) {
      if (!leavingIds.includes(added.id)) {
        api.notify("add", added)

        continue
      }

      const previous = leaving.find(({ id }) => id === added.id)

      if (!isDeepEqual(previous, added)) {
        api.notify("patch", added)
      }
    }

    entity.scene = arriving
  }

  return {
    create(entity, payload, api) {
      build(entity, entity.state, api)
    },

    stateChange(entity, { entityId, to }, api) {
      if (entityId !== entity.id) return

      build(entity, to, api)
    },
  }
}
