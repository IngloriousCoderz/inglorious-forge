import type { Handler, Render } from "@inglorious/engine"
import type { CircleEntity } from "@inglorious/renderer-2d/shapes/circle.js"
import type { Vector3 } from "@inglorious/utils/vector.js"

export interface CoinEntity extends CircleEntity {
  id: string
  position: Vector3
}

export type CoinType = {
  render: Render<CoinEntity>
  coinCollect: Handler<CoinEntity, string>
}
