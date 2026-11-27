import type { GameEntity, Handler } from "../index"

/** The `game` entity's own handlers: pause, resume, quit, and `C` and `D` for debug and dev mode. */
export function game(): {
  pause: Handler<GameEntity>
  resume: Handler<GameEntity>
  quit: Handler<GameEntity>
  keyboardKeyUp: Handler<GameEntity, string>
}
