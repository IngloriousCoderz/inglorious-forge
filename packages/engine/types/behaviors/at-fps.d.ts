import type { Decorator, Entity, Handler, UpdateHandler } from "../index"

export interface AtFpsEntity extends Entity {
  /** The seconds since the entity's last update. */
  fpsClock?: number
}

/**
 * Updates the entity `fps` times a second rather than every frame, with all
 * the time since its last update. Put it last in the type's behaviors.
 */
export function atFps(fps: number): Decorator<{
  create: Handler<AtFpsEntity, unknown>
  update: UpdateHandler<AtFpsEntity>
}>
