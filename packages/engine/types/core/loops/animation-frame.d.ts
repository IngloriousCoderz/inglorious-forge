import type { Updatable } from "./index"

/** Updates once per animation frame, as fast as the screen takes it. */
export class AnimationFrameLoop {
  start(engine: Updatable): void
  stop(): void
}
