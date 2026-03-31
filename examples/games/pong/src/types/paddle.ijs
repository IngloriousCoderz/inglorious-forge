const Z = 2

export const Paddle = {
  create(entity) {
    entity.initialPosition = entity.position
  },

  gameOver(entity) {
    entity.position = entity.initialPosition
  },

  entityTouchMove(entity, { targetId, position }) {
    if (targetId !== entity.id) return

    entity.position[Z] = position[Z]
  },
}
