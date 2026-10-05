/**
 * Builds the scene a state calls for, on entering it and on leaving the last one.
 *
 * It listens to the machine rather than being wired into it, so the machine stays a
 * description of when it moves and this stays the place that knows what a state is made
 * of.
 */
import { buildScene } from "./scene.ijs"

export function scenes() {
  return {
    create(entity, payload, api) {
      buildScene(entity, entity.state, api)
    },

    stateChange(entity, { entityId, to }, api) {
      if (entityId !== entity.id) return

      buildScene(entity, to, api)
    },
  }
}
