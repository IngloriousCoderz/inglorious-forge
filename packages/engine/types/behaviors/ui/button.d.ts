import type { Decorator, Entity, GameType } from "../../index"

export interface ButtonEntity extends Entity {
  state?: "default" | "pressed"
}

/** Looks pressed from `entityPress` to `entityRelease`, and announces it through `stateChange`. */
export function button(): Decorator<GameType<ButtonEntity>>
