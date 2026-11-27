import { add, scale, type Vector3 } from "@inglorious/utils/vector.js"

import type { Entity, GameConfig, GameType } from "../types"
import { clamped } from "../types/behaviors/physics/clamped"

interface BallEntity extends Entity {
  position: Vector3
  velocity: Vector3
}

const Ball: GameType<BallEntity> = {
  update(entity, dt: number) {
    entity.position = add(entity.position, scale(entity.velocity, dt))
  },
}

export default {
  types: { Ball: [Ball, clamped()] },
  entities: {},
} satisfies GameConfig
