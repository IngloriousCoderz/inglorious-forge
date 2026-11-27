import type { Api, BaseEntity } from "@inglorious/store"

export interface GameEntity extends BaseEntity {
  state: "play" | "over"
  timeLeft: number
}

export type GameType = {
  update: (entity: GameEntity, dt: number, api: Api) => void
  restart: (entity: GameEntity, payload: unknown, api: Api) => void
}
