import type { Entity, Handler, UpdateHandler } from "../index"

export interface FpsParams {
  /** Decimals shown. Defaults to 1. */
  accuracy?: number
  size?: number
  /** Seconds between readings. Defaults to 1. */
  speed?: number
  defaultValue?: number
}

export interface FpsEntity extends Entity {
  /** The last frame's seconds, as `value`, read every `speed` seconds. */
  dt?: FpsParams & { value?: number }
}

/** Reads the frame time, for `renderFps` to show. */
export function fps(params?: FpsParams): {
  create: Handler<FpsEntity>
  update: UpdateHandler<FpsEntity>
}
