import { AnimationFrameLoop } from "./animation-frame.js"
import { ElapsedLoop } from "./elapsed.js"
import { FixedLoop } from "./fixed.js"
import { FlashLoop } from "./flash.js"
import { LagLoop } from "./lag.js"

/**
 * The loops a game can ask for, by name.
 *
 * Which loop drives the game is the one thing that decides when `update` is fired, and
 * so when the screen is drawn as well: a loop that waits waits for everything, which is
 * what `fixed` is for and what makes a pointer on it wait too. A game that wants the
 * world to turn slowly and the pointer to keep up does not choose a slower loop -- it
 * says so per entity with `atFps`, and leaves the loop as fast as the screen takes it.
 */
export const Loop = {
  animationFrame: AnimationFrameLoop,
  fixed: FixedLoop,
  lag: LagLoop,
  elapsed: ElapsedLoop,
  flash: FlashLoop,
}

/**
 * @typedef {"animationFrame" | "fixed" | "lag" | "elapsed" | "flash"} LoopType -
 *   The name of a loop, as written in a game's `loop.type`.
 */
