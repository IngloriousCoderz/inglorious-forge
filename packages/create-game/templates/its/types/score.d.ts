import type { Api, BaseEntity } from "@inglorious/store"

export interface ScoreEntity extends BaseEntity {
  points: number
  level: number
  best: number
  value: string
}

export type ScoreType = {
  render: (...args: unknown[]) => void
  coinCollect: (entity: ScoreEntity) => void
  roundStart: (entity: ScoreEntity) => void
  roundOver: (entity: ScoreEntity) => void
  update: (entity: ScoreEntity, dt: number, api: Api) => void
}
