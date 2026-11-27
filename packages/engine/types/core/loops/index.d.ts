import { AnimationFrameLoop } from "./animation-frame"
import { FixedLoop } from "./fixed"

/** The name of a loop, as written in a game's `loop.type`. */
export type LoopType = "animationFrame" | "fixed"

/** What a loop drives: anything with an `update` that takes seconds. */
export interface Updatable {
  update(dt: number): void
}

/** The loops a game can ask for, by name. */
export const Loop: {
  animationFrame: typeof AnimationFrameLoop
  fixed: typeof FixedLoop
}
