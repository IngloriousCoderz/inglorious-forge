import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { findCollision } from "@inglorious/engine/collision/detection.js"
import { renderCircle } from "@inglorious/renderer-2d/shapes/circle.js"
import {
  add,
  magnitude,
  setMagnitude,
  subtract,
  type Vector3,
} from "@inglorious/utils/vector.js"

import type { GameEntity, PlayerEntity, PlayerType } from "#types"

const Player: PlayerType = {
  render: renderCircle,

  touchStart(entity, { position }) {
    entity.target = position
  },

  touchMove(entity, { position }) {
    entity.target = position
  },

  touchEnd(entity) {
    entity.target = null
  },

  update(entity, dt, api) {
    const game = api.getEntity("game") as GameEntity
    if (game.state !== "play") return

    if (entity.target) followTarget(entity, entity.target, dt)

    const coin = findCollision(entity, api.getEntities())
    if (coin) api.notify("coinCollect", coin.id)
  },
}

export default [Player, modernControls(), clamped()]

function followTarget(entity: PlayerEntity, target: Vector3, dt: number) {
  const toTarget = subtract(target, entity.position)
  const step = Math.min(magnitude(toTarget), entity.maxSpeed * dt)
  if (step) entity.position = add(entity.position, setMagnitude(toTarget, step))
}
