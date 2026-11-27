import type { BaseEntity } from "@inglorious/store"
import type { Vector3 } from "@inglorious/utils/vector.js"

export interface CoinEntity extends BaseEntity {
  id: string
  position: Vector3
}

export type CoinType = {
  render: (...args: unknown[]) => void
  coinCollect: (entity: CoinEntity, coinId: string) => void
}
