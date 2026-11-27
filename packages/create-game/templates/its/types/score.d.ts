import type { Handler, Render, UpdateHandler } from "@inglorious/engine"
import type { TextEntity } from "@inglorious/renderer-2d/text.js"

export interface ScoreEntity extends TextEntity {
  points: number
  level: number
  best: number
  value: string
}

export type ScoreType = {
  render: Render<ScoreEntity>
  coinCollect: Handler<ScoreEntity>
  roundStart: Handler<ScoreEntity>
  roundOver: Handler<ScoreEntity>
  update: UpdateHandler<ScoreEntity>
}
