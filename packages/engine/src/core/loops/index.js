import { AnimationFrameLoop } from "./animation-frame.js"
import { FixedLoop } from "./fixed.js"

/**
 * The loops a game can ask for, by name. The loop decides when `update` fires,
 * and so when the screen is drawn: `animationFrame` runs as fast as the screen
 * takes it, `fixed` waits for its rate and makes everything wait with it. A game
 * that wants the world to turn slowly and the pointer to keep up says so per
 * entity with `atFps`, and leaves the loop fast.
 */
export const Loop = {
  animationFrame: AnimationFrameLoop,
  fixed: FixedLoop,
}

/**
 * @typedef {"animationFrame" | "fixed"} LoopType - The name of a loop, as written in a game's `loop.type`.
 */
