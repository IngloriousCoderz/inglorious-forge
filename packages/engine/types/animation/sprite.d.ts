import type { Entity } from "../index"
import type { TickerTarget } from "./ticker"

/** A sprite's frames per animation, and the animation it plays. */
export interface SpriteState extends TickerTarget {
  /** Each animation's frames, as tile indices; see `flippedHorizontally`. */
  frames: Record<string, number[]>
  state?: string
}

export interface SpriteEntity extends Entity {
  sprite: SpriteState
}

export const Sprite: {
  /** The state among `states` that the entity's orientation points to. */
  fromAngle(entity: SpriteEntity, states: string[]): string
  move2(entity: SpriteEntity): string
  move4(entity: SpriteEntity): string
  move6(entity: SpriteEntity): string
  move8(entity: SpriteEntity): string
  /** Advances the animation, and notifies `spriteAnimationEnd` on its last frame. */
  play(
    animation: string,
    params: {
      entity: SpriteEntity
      dt: number
      notify: (type: string, payload?: unknown) => void
    },
  ): void
}
