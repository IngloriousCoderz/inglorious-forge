import type { Decorator, Entity, Render, Shape } from "../../index"

/** Draws the entity's collision shapes over it while the game's `debug` is on. */
export function collisionGizmos(params?: {
  /** How to draw each shape. */
  shapes?: Partial<Record<Shape, Render>>
}): Decorator<{ render: Render<Entity> }>
