import type {
  GameEntity as EngineGameEntity,
  Handler,
  UpdateHandler,
} from "@inglorious/engine"

export interface GameEntity extends EngineGameEntity {
  state: "play" | "over"
  timeLeft: number
}

export type GameType = {
  update: UpdateHandler<GameEntity>
  restart: Handler<GameEntity>
}
