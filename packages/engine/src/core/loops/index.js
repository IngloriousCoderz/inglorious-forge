import { AnimationFrameLoop } from "./animation-frame.js"
import { ElapsedLoop } from "./elapsed.js"
import { FixedLoop } from "./fixed.js"
import { FlashLoop } from "./flash.js"
import { LagLoop } from "./lag.js"

// @see https://gameprogrammingpatterns.com/game-loop.html

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
  // Every frame, as fast as the browser will take one. The default, and the one to keep
  // when something in the game decides its own rate.
  animationFrame: AnimationFrameLoop,
  // One frame every `fps`, measured from the end of the last.
  fixed: FixedLoop,
  // One frame every `fps`, catching up however far behind it fell.
  lag: LagLoop,
  // As fast as the machine allows, with no cap at all.
  elapsed: ElapsedLoop,
  // As fast as the machine allows, with nothing drawing.
  flash: FlashLoop,
}

/**
 * @typedef {"animationFrame" | "fixed" | "lag" | "elapsed" | "flash"} LoopType -
 *   The name of a loop, as written in a game's `loop.type`.
 */
