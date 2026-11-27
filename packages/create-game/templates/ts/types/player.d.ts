import type { Handler, Render, UpdateHandler } from "@inglorious/engine"
import type { TouchPayload } from "@inglorious/engine/behaviors/input/touch.js"
import type { CircleEntity } from "@inglorious/renderer-2d/shapes/circle.js"
import type { Vector3 } from "@inglorious/utils/vector.js"

export interface PlayerEntity extends CircleEntity {
  position: Vector3
  maxSpeed: number
  target?: Vector3 | null
}

export type PlayerType = {
  render: Render<PlayerEntity>
  touchStart: Handler<PlayerEntity, TouchPayload>
  touchMove: Handler<PlayerEntity, TouchPayload>
  touchEnd: Handler<PlayerEntity>
  update: UpdateHandler<PlayerEntity>
}
