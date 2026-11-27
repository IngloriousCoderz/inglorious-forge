import type { Api, BaseEntity } from "@inglorious/store"
import type { Vector3 } from "@inglorious/utils/vector.js"

export interface PlayerEntity extends BaseEntity {
  position: Vector3
  maxSpeed: number
  target?: Vector3 | null
}

export interface Touch {
  position: Vector3
}

export type PlayerType = {
  render: (...args: unknown[]) => void
  touchStart: (entity: PlayerEntity, touch: Touch) => void
  touchMove: (entity: PlayerEntity, touch: Touch) => void
  touchEnd: (entity: PlayerEntity) => void
  update: (entity: PlayerEntity, dt: number, api: Api) => void
}
