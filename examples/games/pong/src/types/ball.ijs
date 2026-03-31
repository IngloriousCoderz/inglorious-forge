/* eslint-disable no-magic-numbers */
import { findCollision } from "@inglorious/engine/collision/detection"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle"
import { choose, random } from "@inglorious/utils/math/rng"
import { pi } from "@inglorious/utils/math/trigonometry"
import { fromAngle } from "@inglorious/utils/math/vector"

const X = 0
const Z = 2
const REVERSE = -1

export const Ball = {
  render: renderRectangle,

  create(entity) {
    entity.initialSpeed = entity.maxSpeed
    entity.initialPosition = entity.position
  },

  entityTouchEnd(entity, { targetId }, api) {
    if (targetId !== entity.id) return

    api.notify("action")
  },

  serve(entity, servingPlayer) {
    entity.position = entity.initialPosition
    entity.maxSpeed = entity.initialSpeed

    switch (servingPlayer) {
      case "player1":
        entity.orientation = choose((-1 / 6) * pi(), (1 / 6) * pi())
        break

      case "player2":
        entity.orientation = choose((5 / 6) * pi(), (7 / 6) * pi())
        break
    }
  },

  update(entity, dt, api) {
    const game = api.getEntity("game")
    if (game.state !== "play") return

    if (handleScoring(entity, game, api)) {
      return
    }

    handleWallCollision(entity, game, api)
    handlePaddleCollision(entity, api)
    updatePosition(entity, dt)
  },
}

function handleScoring(entity, game, api) {
  const [gameWidth] = game.size

  const isOutOfBounds = entity.position[X] < 0 || entity.position[X] > gameWidth
  if (!isOutOfBounds) {
    return false
  }

  api.notify("soundPlay", "score")

  if (entity.position[X] < 0) {
    api.notify("playerScore", "player2")
  } else {
    api.notify("playerScore", "player1")
  }

  return true
}

function handleWallCollision(entity, game, api) {
  const [, gameHeight] = game.size

  if (entity.position[Z] < 0 || entity.position[Z] > gameHeight) {
    api.notify("soundPlay", "wallHit")
    entity.orientation *= REVERSE
  }
}

function handlePaddleCollision(entity, api) {
  const entities = api.getEntities()
  const collidingEntity = findCollision(entity, entities)

  if (!collidingEntity) {
    return
  }

  api.notify("soundPlay", "paddleHit")

  const paddleHalfWidth = collidingEntity.size[X] / 2
  const ballHalfWidth = entity.size[X] / 2

  const isMovingLeft = entity.velocity[X] < 0

  let targetX
  if (isMovingLeft) {
    entity.orientation = random((-1 / 6) * pi(), (1 / 6) * pi())
    targetX = collidingEntity.position[X] + paddleHalfWidth + ballHalfWidth
  } else {
    entity.orientation = random((5 / 6) * pi(), (7 / 6) * pi())
    targetX = collidingEntity.position[X] - paddleHalfWidth - ballHalfWidth
  }

  entity.position[X] = targetX
  entity.maxSpeed *= entity.speedIncrease
}

function updatePosition(entity, dt) {
  entity.velocity = fromAngle(entity.orientation) * entity.maxSpeed
  entity.position += entity.velocity * dt
}
