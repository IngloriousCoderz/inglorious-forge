import { Sprite } from "../animation/sprite.js"

/**
 * Advances sprite animations for entities that have a sprite component
 * with an active animation state.
 *
 * @param {Object} state - The game state, containing all entities.
 * @param {Object<string, Object>} entities - A map of entity IDs to entity objects.
 * @param {number} dt - The delta time since the last update.
 * @param {Object} api - The game API.
 * @param {Function} api.notify - A function to notify about events.
 */
export function spriteAnimationSystem() {
  return {
    update(entities, dt, api) {
      for (const id in entities) {
        const entity = entities[id]

        if (!entity.sprite || !entity.sprite.state) {
          continue
        }

        Sprite.play(entity.sprite.state, { entity, dt, notify: api.notify })
      }
    },
  }
}
