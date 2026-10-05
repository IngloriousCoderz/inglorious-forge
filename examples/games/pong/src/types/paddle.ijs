import { createMovementEventHandlers } from "@inglorious/engine/behaviors/controls/event-handlers.js"

const Z = 2

/**
 * One paddle.
 *
 * The controls are per player — `player1Up`, `player2Down` and so on — because there
 * is one mapping for the whole game and an action's name is what addresses it. The
 * shared movement behaviours only know `moveUp` and `moveDown`, so each paddle says
 * which of its own actions feed them.
 */
export const paddle = (player) => [
  // Each player has its own actions, and the keyboard mapping is what keeps them
  // apart: player one listens to A and D, player two to the arrow keys. If both
  // listened to the same key that would be the game's doing, not the engine's.
  createMovementEventHandlers([`${player}Up`, `${player}Down`]),

  {
    create(entity) {
      entity.initialPosition = entity.position
    },

    // The shared movement behaviours only read `moveUp` and `moveDown`, so this
    // paddle's own actions are fed to them.
    update(entity) {
      const { movement } = entity

      movement.moveUp = !!movement[`${player}Up`]
      movement.moveDown = !!movement[`${player}Down`]
    },

    gameOver(entity) {
      entity.position = entity.initialPosition
    },

    entityTouchMove(entity, { targetId, position }) {
      if (targetId !== entity.id) return

      entity.position[Z] = position[Z]
    },
  },
]
