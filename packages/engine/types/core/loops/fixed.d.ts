import type { Updatable } from "./index"

/** Updates every `msPerUpdate` milliseconds. */
export class FixedLoop {
  start(engine: Updatable, msPerUpdate: number): Promise<void>
  stop(): void
}
