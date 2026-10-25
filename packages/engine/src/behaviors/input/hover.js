import { findCollision } from "../../collision/detection.js"

const HAND = "hand"
const DEFAULT_CURSOR = "arrow"

/**
 * A pointer that turns into a hand over anything there is room to press.
 *
 * Anything with a hitbox is something a press would land on, so the pointer going
 * over one of those is the game saying "this does something" the way a desktop does.
 * Written as a decorator rather than as part of the mouse itself, so a game that has
 * nothing to press -- or a mouse that is meant to stay a crosshair whatever it is
 * over -- simply leaves it out.
 *
 * @param {Object} [cursors] - What the pointer is when it is not over anything.
 * @param {string} [cursors.off] - The cursor away from anything pressable.
 */
export function hover({ off = DEFAULT_CURSOR } = {}) {
  return (type) => ({
    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.cursor ??= off
    },

    mouseMove(entity, position, api) {
      type.mouseMove?.(entity, position, api)

      point(entity, api, off)
    },

    mouseDown(entity, position, api) {
      type.mouseDown?.(entity, position, api)

      point(entity, api, off)
    },

    mouseUp(entity, position, api) {
      type.mouseUp?.(entity, position, api)

      point(entity, api, off)
    },
  })
}

/**
 * Puts the hand up or takes it down again.
 *
 * Something pressable under the pointer, or something pressed whatever the pointer has
 * wandered off to since: a drag that started on a control should not flicker back
 * while it is still being held.
 */
function point(entity, api, off) {
  const held = entity.pressedId ?? findCollision(entity, api.getEntities())?.id

  entity.cursor = held ? HAND : off
}
